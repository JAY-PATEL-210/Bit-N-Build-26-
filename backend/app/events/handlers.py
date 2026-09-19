# Owner: Member D (Backend AI / Agent & Integration)
# Event handlers — Dispatches disruption events to the orchestrator pipeline
from typing import Dict, Any
from datetime import datetime
import asyncio
import logging

from app.agents.orchestrator.travel_orchestrator import TravelAgentOrchestrator
from app.events.event_types import EventType

logger = logging.getLogger("AutonomousTravelConcierge.EventHandlers")


def handle_disruption_event(event_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Entry point for all disruption events.
    Dispatches to the TravelAgentOrchestrator pipeline.

    Supports event types:
    - FLIGHT_CANCELLED: Immediate cancellation, triggers full pipeline
    - FLIGHT_DELAYED: Delay event, checks connection feasibility
    - MISSED_CONNECTION: Detected missed connection
    - BOOKING_FAILURE: Booking API failure, triggers retry/escalation

    Args:
        event_payload: Raw disruption event dict

    Returns:
        Pipeline result dict with decision, execution, and audit trail
    """
    event_type = event_payload.get("eventType", "UNKNOWN")
    flight_id = event_payload.get("flightId", "UNKNOWN")
    itinerary_id = event_payload.get("itineraryId", "UNKNOWN")

    logger.info(
        "═══ DISRUPTION EVENT RECEIVED ═══\n"
        "  Type:       %s\n"
        "  Flight:     %s\n"
        "  Itinerary:  %s\n"
        "  Timestamp:  %s",
        event_type, flight_id, itinerary_id,
        event_payload.get("timestamp", datetime.utcnow().isoformat()),
    )

    # Validate event type
    valid_types = {e.value for e in EventType}
    # Also accept simulation-specific types
    valid_types.update({"MISSED_CONNECTION", "BOOKING_FAILURE"})

    if event_type not in valid_types:
        logger.warning("Unknown event type: %s", event_type)
        return {
            "status": "REJECTED",
            "reason": f"Unknown event type: {event_type}",
            "valid_types": sorted(valid_types),
        }

    # Create orchestrator and run pipeline
    orchestrator = TravelAgentOrchestrator()

    # Run the async pipeline synchronously
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If already in an async context, create a task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                result = pool.submit(
                    asyncio.run,
                    orchestrator.run_disruption_pipeline(
                        disruption_event=event_payload
                    )
                ).result()
        else:
            result = loop.run_until_complete(
                orchestrator.run_disruption_pipeline(
                    disruption_event=event_payload
                )
            )
    except RuntimeError:
        # No event loop exists
        result = asyncio.run(
            orchestrator.run_disruption_pipeline(
                disruption_event=event_payload
            )
        )

    logger.info(
        "═══ DISRUPTION PIPELINE COMPLETE ═══\n"
        "  Disruption: %s\n"
        "  Decision:   %s\n"
        "  Duration:   %sms",
        result.get("disruption_id"),
        result.get("status"),
        result.get("pipeline_duration_ms", "N/A"),
    )

    return result


def handle_booking_failure(event_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handles booking failure events — triggers retry or escalation.
    """
    disruption_id = event_payload.get("disruptionId", "UNKNOWN")
    alternative_id = event_payload.get("alternativeId", "UNKNOWN")
    reason = event_payload.get("reason", "UNKNOWN")

    logger.warning(
        "BOOKING FAILURE: disruption=%s, alternative=%s, reason=%s",
        disruption_id, alternative_id, reason,
    )

    return {
        "status": "ESCALATED",
        "disruption_id": disruption_id,
        "alternative_id": alternative_id,
        "failure_reason": reason,
        "action": "ESCALATE_TO_HUMAN",
        "message": (
            f"Booking for alternative {alternative_id} failed: {reason}. "
            f"The case has been escalated to a human agent."
        ),
    }
