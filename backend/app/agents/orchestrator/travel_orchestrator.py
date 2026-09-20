# Owner: Member D (Backend AI / Agent & Integration)
# Section 26, 64: Agent Orchestrator — Coordinates the full autonomous disruption pipeline
# Section 27: AI never directly executes booking or payment
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

from app.agents.context_builder import ContextBuilder
from app.agents.flight_evaluator import FlightEvaluator
from app.agents.decision_agent.decision_agent import DecisionAgent, AiDecisionOutput
from app.agents.guardrails import AiGuardrails
from app.services.policy.policy_engine import PolicyEngine
from app.integrations.flight_provider.flight_provider import MockFlightProvider, FlightProvider
from app.integrations.flight.duffel import DuffelFlightProvider
from app.integrations.booking.mock import MockBookingProvider
from app.integrations.booking.duffel import DuffelBookingProvider
from app.integrations.hotel.mock import MockHotelProvider
from app.integrations.hotel.serpapi import SerpApiHotelProvider
from app.integrations.notification.mock import MockNotificationProvider
from app.utils.idempotency import generate_idempotency_key
from app.core.config import settings

logger = logging.getLogger("AutonomousTravelConcierge.Orchestrator")


# Default demo itinerary matching the SRS scenario
DEFAULT_DEMO_ITINERARY = {
    "id": "TRIP-001",
    "traveler": {
        "name": "Priya Sharma",
        "email": "priya.sharma@company.com",
        "phone": "+91-98765-43210",
        "preferences": {"seat": "window", "meal": "vegetarian"},
    },
    "segments": [
        {
            "segment_id": "SEG-001",
            "flight_id": "AI101",
            "airline": "Air India",
            "origin": "BOM",
            "destination": "DEL",
            "departure_time": "2026-06-10T14:30:00",
            "arrival_time": "2026-06-10T16:45:00",
            "status": "SCHEDULED",
        },
        {
            "segment_id": "SEG-002",
            "flight_id": "AI203",
            "airline": "Air India",
            "origin": "DEL",
            "destination": "LHR",
            "departure_time": "2026-06-10T21:00:00",
            "arrival_time": "2026-06-11T03:30:00",
            "status": "SCHEDULED",
        },
    ],
    "hotel": {
        "hotel_id": "HTL-001",
        "name": "London Grand Hotel",
        "check_in": "2026-06-11",
        "check_out": "2026-06-14",
        "city": "London",
    },
}

# Default travel policy
DEFAULT_POLICY = {
    "maximumAdditionalFare": 20000,
    "currency": "INR",
    "maximumStops": 1,
    "minimumConnectionMinutes": 90,
    "autonomousRebooking": True,
    "autonomousHotelModification": True,
}


class TravelAgentOrchestrator:
    """
    Coordinates the 5-layer autonomous disruption pipeline (Appendix J):

    Layer 1 — PERCEPTION:    Receive disruption event, build structured context
    Layer 2 — REASONING:     Evaluate candidates via FlightEvaluator scoring
    Layer 3 — POLICY:        Validate via deterministic PolicyEngine (AI cannot override)
    Layer 4 — ACTION PREP:   Generate structured AI decision via DecisionAgent
    Layer 5 — VERIFICATION:  Validate via Guardrails, execute rebooking if approved

    The orchestrator coordinates but does NOT make decisions itself.
    Each layer is independently testable and auditable.
    """

    def __init__(
        self,
        flight_provider: Optional[FlightProvider] = None,
        booking_provider: Optional[MockBookingProvider] = None,
        hotel_provider: Optional[MockHotelProvider] = None,
        notification_provider: Optional[MockNotificationProvider] = None,
        ai_api_key: Optional[str] = None,
        ai_model: str = "gpt-4o",
        ai_base_url: Optional[str] = None,
    ):
        self.context_builder = ContextBuilder()
        self.flight_evaluator = FlightEvaluator()
        self.decision_agent = DecisionAgent(api_key=ai_api_key, model=ai_model, base_url=ai_base_url)
        self.guardrails = AiGuardrails()

        self.flight_provider = flight_provider or (DuffelFlightProvider() if settings.FLIGHT_API_KEY else MockFlightProvider())
        self.booking_provider = booking_provider or (DuffelBookingProvider() if settings.BOOKING_API_KEY else MockBookingProvider())
        self.hotel_provider = hotel_provider or (SerpApiHotelProvider() if settings.HOTEL_API_KEY else MockHotelProvider())
        self.notification_provider = notification_provider or MockNotificationProvider()

    async def run_disruption_pipeline(
        self,
        disruption_event: Dict[str, Any],
        itinerary_data: Optional[Dict[str, Any]] = None,
        policy: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Runs the complete 5-layer autonomous pipeline for a disruption event.

        Args:
            disruption_event: Raw disruption event payload
            itinerary_data: Itinerary data (uses demo default if None)
            policy: Travel policy (uses demo default if None)

        Returns:
            Complete pipeline result with audit trail
        """
        pipeline_start = datetime.utcnow()
        itinerary = itinerary_data or DEFAULT_DEMO_ITINERARY
        travel_policy = policy or DEFAULT_POLICY

        disruption_id = disruption_event.get(
            "disruptionId",
            f"DIS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        )

        audit_trail = {
            "disruption_id": disruption_id,
            "pipeline_started_at": pipeline_start.isoformat(),
            "layers": {},
        }

        try:
            # =====================================================
            # LAYER 1: PERCEPTION — Context Building
            # =====================================================
            logger.info("[Layer 1/5] PERCEPTION — Building context for %s", disruption_id)

            # Fetch flight status from provider
            flight_id = disruption_event.get("flightId", "")
            flight_status = self.flight_provider.get_flight_status(flight_id)

            # Search for alternative flights
            origin = disruption_event.get("origin", "BOM")
            destination = disruption_event.get("destination", "DEL")
            departure_date = disruption_event.get("date", "2026-09-22")
            raw_alternatives = self.flight_provider.search_alternatives(
                origin, destination, departure_date
            )

            # Build structured context
            context = self.context_builder.build_disruption_context(
                disruption_event=disruption_event,
                itinerary=itinerary,
                policy=travel_policy,
                candidate_alternatives=raw_alternatives,
            )

            audit_trail["layers"]["perception"] = {
                "status": "COMPLETE",
                "flight_status": flight_status,
                "candidates_found": len(raw_alternatives),
                "affected_segments": len(context.get("affected_segments", [])),
                "downstream_impacts": len(context.get("downstream_impacts", [])),
            }

            # =====================================================
            # LAYER 2: REASONING — Candidate Evaluation & Scoring
            # =====================================================
            logger.info("[Layer 2/5] REASONING — Evaluating %d candidates", len(raw_alternatives))

            eval_policy = {**travel_policy}
            if disruption_event.get("forcePolicyExceeded"):
                eval_policy["forcePolicyExceeded"] = True

            scored_alternatives = self.flight_evaluator.evaluate_alternatives(
                candidates=raw_alternatives,
                policy=eval_policy,
                traveler_preferences=itinerary.get("traveler", {}).get("preferences"),
            )

            compliant = self.flight_evaluator.get_compliant_alternatives(scored_alternatives)

            audit_trail["layers"]["reasoning"] = {
                "status": "COMPLETE",
                "total_scored": len(scored_alternatives),
                "compliant_count": len(compliant),
                "rejected_count": len(scored_alternatives) - len(compliant),
                "scored_alternatives": [
                    {
                        "id": a.get("id"),
                        "score": a.get("score"),
                        "compliant": a.get("policy_compliant"),
                    }
                    for a in scored_alternatives
                ],
            }

            # =====================================================
            # LAYER 3: POLICY — Deterministic Policy Validation
            # =====================================================
            logger.info("[Layer 3/5] POLICY — Validating against travel policy")

            policy_engine = PolicyEngine(travel_policy)
            policy_results = {}
            for alt in scored_alternatives:
                result = policy_engine.validate_alternative(alt)
                policy_results[alt.get("id", "unknown")] = result

            audit_trail["layers"]["policy"] = {
                "status": "COMPLETE",
                "validation_results": policy_results,
            }

            # =====================================================
            # LAYER 4: ACTION PREPARATION — AI Decision
            # =====================================================
            logger.info("[Layer 4/5] ACTION PREP — Generating AI decision")

            decision_policy = {**travel_policy}
            if disruption_event.get("forcePolicyExceeded"):
                decision_policy["forcePolicyExceeded"] = True

            ai_decision = self.decision_agent.evaluate(
                candidate_options=scored_alternatives,
                policy=decision_policy,
                context=context,
            )

            decision_dict = ai_decision.model_dump()

            audit_trail["layers"]["action_preparation"] = {
                "status": "COMPLETE",
                "decision": decision_dict["decision"],
                "selected_alternative": decision_dict["selectedAlternativeId"],
                "confidence": decision_dict["confidence"],
                "requires_approval": decision_dict["requiresApproval"],
                "reason_codes": decision_dict["reasonCodes"],
                "explanation": decision_dict["explanation"],
            }

            # =====================================================
            # LAYER 5: VERIFICATION — Guardrails & Execution
            # =====================================================
            logger.info("[Layer 5/5] VERIFICATION — Running guardrails & execution")

            guarded_decision = self.guardrails.enforce_guardrails(
                decision_output=decision_dict,
                candidate_alternatives=scored_alternatives,
                policy=travel_policy,
            )

            guardrail_passed = guarded_decision["guardrail_result"]["passed"]

            audit_trail["layers"]["verification"] = {
                "status": "COMPLETE",
                "guardrail_passed": guardrail_passed,
                "guardrail_violations": guarded_decision["guardrail_result"]["violations"],
            }

            # --- Execute if approved ---
            execution_result = None
            hotel_result = None
            notification_result = None

            final_decision = guarded_decision["decision"]
            requires_approval = guarded_decision.get("requiresApproval", True)

            if final_decision == "REBOOK" and not requires_approval and guardrail_passed:
                # Autonomous rebooking
                selected_id = guarded_decision["selectedAlternativeId"]
                idempotency_key = generate_idempotency_key("REBOOK")

                execution_result = self.booking_provider.book_flight(
                    flight_id=selected_id,
                    passenger_info={
                        "name": itinerary.get("traveler", {}).get("name", "Traveler"),
                        "itinerary_id": itinerary.get("id", "UNKNOWN"),
                    },
                    idempotency_key=idempotency_key,
                )

                # Hotel modification if needed
                hotel = itinerary.get("hotel")
                if hotel and travel_policy.get("autonomousHotelModification", True):
                    hotel_result = self.hotel_provider.modify_reservation(
                        hotel_id=hotel.get("hotel_id", "HTL-001"),
                        new_check_in="2026-06-11",
                        new_check_out=hotel.get("check_out", "2026-06-14"),
                    )

                # Send notification
                traveler = itinerary.get("traveler", {})
                notification_result = self.notification_provider.send_notification(
                    recipient=traveler.get("email", "traveler@example.com"),
                    title="Flight Rebooking Confirmed",
                    message=guarded_decision.get("explanation", "Your flight has been rebooked."),
                )

            elif final_decision == "ESCALATE" or requires_approval:
                # Send escalation notification
                traveler = itinerary.get("traveler", {})
                notification_result = self.notification_provider.send_notification(
                    recipient=traveler.get("email", "traveler@example.com"),
                    title="Action Required: Flight Disruption",
                    message=guarded_decision.get("explanation", "Your approval is needed."),
                )

            audit_trail["layers"]["execution"] = {
                "status": "COMPLETE",
                "final_decision": final_decision,
                "requires_approval": requires_approval,
                "booking_result": execution_result,
                "hotel_result": hotel_result,
                "notification_sent": notification_result is not None,
            }

            # --- Final result ---
            pipeline_end = datetime.utcnow()
            duration_ms = int((pipeline_end - pipeline_start).total_seconds() * 1000)

            result = {
                "disruption_id": disruption_id,
                "status": final_decision,
                "decision": guarded_decision,
                "execution": {
                    "booking": execution_result,
                    "hotel": hotel_result,
                    "notification_sent": notification_result is not None,
                },
                "audit_trail": audit_trail,
                "pipeline_duration_ms": duration_ms,
                "completed_at": pipeline_end.isoformat(),
            }

            logger.info(
                "Pipeline complete for %s: decision=%s, duration=%dms",
                disruption_id, final_decision, duration_ms,
            )

            return result

        except Exception as e:
            logger.error("Pipeline FAILED for %s: %s", disruption_id, str(e))
            audit_trail["error"] = str(e)
            return {
                "disruption_id": disruption_id,
                "status": "ERROR",
                "error": str(e),
                "audit_trail": audit_trail,
            }
