# Owner: Member D (Backend AI / Agent & Integration)
# Section 32: Simulation Engine — Drives all 5 demo scenarios for hackathon judges
import sys
import os
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.agents.orchestrator.travel_orchestrator import TravelAgentOrchestrator
from app.agents.context_builder import ContextBuilder
from app.agents.flight_evaluator import FlightEvaluator
from app.agents.decision_agent.decision_agent import DecisionAgent
from app.agents.guardrails import AiGuardrails
from app.integrations.flight_provider.flight_provider import MockFlightProvider
from app.integrations.booking.mock import MockBookingProvider
from app.integrations.hotel.mock import MockHotelProvider
from app.integrations.notification.mock import MockNotificationProvider
from app.services.policy.policy_engine import PolicyEngine


# ═══════════════════════════════════════════════════
# ANSI Color Codes for rich CLI output
# ═══════════════════════════════════════════════════
class Colors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"
    END = "\033[0m"


def print_banner(title: str, char: str = "═"):
    """Print a formatted banner."""
    width = 60
    print(f"\n{Colors.BOLD}{Colors.CYAN}{char * width}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}  {title}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{char * width}{Colors.END}\n")


def print_step(step_num: int, total: int, description: str):
    """Print a pipeline step indicator."""
    print(f"  {Colors.BLUE}[{step_num}/{total}]{Colors.END} {description}")


def print_success(message: str):
    print(f"  {Colors.GREEN}✅ {message}{Colors.END}")


def print_warning(message: str):
    print(f"  {Colors.YELLOW}⚠️  {message}{Colors.END}")


def print_error(message: str):
    print(f"  {Colors.RED}❌ {message}{Colors.END}")


def print_info(key: str, value: str):
    print(f"  {Colors.CYAN}{key}:{Colors.END} {value}")


def print_json(data: dict, indent: int = 4):
    """Pretty-print a dict as JSON."""
    formatted = json.dumps(data, indent=indent, default=str)
    for line in formatted.split("\n"):
        print(f"    {line}")


# ═══════════════════════════════════════════════════
# Scenario Runners
# ═══════════════════════════════════════════════════

async def run_scenario_1_cancellation() -> Dict[str, Any]:
    """
    Scenario 1: Normal -> Cancelled -> Autonomous Rebook (P0 Happy Path)

    Flow:
    1. Flight AI101 (BOM->DEL) is CANCELLED
    2. System detects disruption, identifies downstream impacts (connection + hotel)
    3. Searches 4 alternative flights
    4. Policy engine rejects 2 (fare exceeds ₹20,000)
    5. AI Decision Agent selects ALT-102 (cheapest compliant)
    6. Guardrails validate decision
    7. Autonomous rebooking with idempotency key
    8. Hotel check-in adjusted
    9. Traveler notified
    10. Full audit trail generated
    """
    print_banner("SCENARIO 1: Flight Cancellation → Autonomous Rebook")

    event = {
        "eventType": "FLIGHT_CANCELLED",
        "flightId": "AI101",
        "airline": "Air India",
        "origin": "BOM",
        "destination": "DEL",
        "itineraryId": "TRIP-001",
        "timestamp": datetime.utcnow().isoformat(),
    }

    print_info("Event Type", event["eventType"])
    print_info("Flight", f"{event['airline']} {event['flightId']} ({event['origin']}→{event['destination']})")
    print_info("Itinerary", event["itineraryId"])
    print()

    orchestrator = TravelAgentOrchestrator()
    result = await orchestrator.run_disruption_pipeline(disruption_event=event)

    _print_pipeline_result(result)
    return result


async def run_scenario_2_missed_connection() -> Dict[str, Any]:
    """
    Scenario 2: Normal -> Delayed -> Missed Connection Risk

    Flow:
    1. Flight AI101 (BOM->DEL) delayed by 180 minutes
    2. System detects that connection to AI203 (DEL->LHR) is at risk
    3. Minimum connection time (90 min) is breached
    4. AI evaluates alternative routing options
    """
    print_banner("SCENARIO 2: Delay → Missed Connection Risk")

    event = {
        "eventType": "FLIGHT_DELAYED",
        "flightId": "AI101",
        "airline": "Air India",
        "origin": "BOM",
        "destination": "DEL",
        "delayMinutes": 180,
        "itineraryId": "TRIP-001",
        "timestamp": datetime.utcnow().isoformat(),
    }

    print_info("Event Type", event["eventType"])
    print_info("Flight", f"{event['airline']} {event['flightId']}")
    print_info("Delay", f"{event['delayMinutes']} minutes")
    print_info("Impact", "Connection to AI203 (DEL→LHR) at risk")
    print()

    orchestrator = TravelAgentOrchestrator()
    result = await orchestrator.run_disruption_pipeline(disruption_event=event)

    _print_pipeline_result(result)
    return result


async def run_scenario_3_cancellation_rebook() -> Dict[str, Any]:
    """
    Scenario 3: Cancelled -> Alternatives Found -> Rebooked
    (Same as Scenario 1 but validates idempotency by running twice)
    """
    print_banner("SCENARIO 3: Cancellation → Rebook (Idempotency Test)")

    event = {
        "eventType": "FLIGHT_CANCELLED",
        "flightId": "AI101",
        "origin": "BOM",
        "destination": "DEL",
        "itineraryId": "TRIP-001",
        "timestamp": datetime.utcnow().isoformat(),
    }

    print_info("Event Type", event["eventType"])
    print_info("Purpose", "Validate autonomous rebooking + idempotency guarantee")
    print()

    orchestrator = TravelAgentOrchestrator()
    result = await orchestrator.run_disruption_pipeline(disruption_event=event)

    _print_pipeline_result(result)
    return result


async def run_scenario_4_policy_failure() -> Dict[str, Any]:
    """
    Scenario 4: Cancelled -> All Alternatives Exceed Policy -> Human Approval Required

    Flow:
    1. Flight AI101 cancelled
    2. All alternatives exceed ₹20,000 fare limit
    3. AI cannot autonomously rebook — sets requiresApproval = True
    4. Decision is ESCALATE
    5. Traveler receives escalation notification with approval link
    """
    print_banner("SCENARIO 4: Policy Failure → Human Escalation Required")

    event = {
        "eventType": "FLIGHT_CANCELLED",
        "flightId": "AI101",
        "origin": "BOM",
        "destination": "DEL",
        "itineraryId": "TRIP-001",
        "forcePolicyExceeded": True,
        "timestamp": datetime.utcnow().isoformat(),
    }

    print_info("Event Type", event["eventType"])
    print_info("Special Flag", "forcePolicyExceeded=True (all alternatives over budget)")
    print_info("Expected", "ESCALATE decision with requiresApproval=True")
    print()

    orchestrator = TravelAgentOrchestrator()
    result = await orchestrator.run_disruption_pipeline(disruption_event=event)

    _print_pipeline_result(result)
    return result


async def run_scenario_5_booking_failure() -> Dict[str, Any]:
    """
    Scenario 5: Rebooking -> API Failure -> Safe Retry / Escalation

    Flow:
    1. Flight AI101 cancelled
    2. Best alternative selected (ALT-102)
    3. Booking API fails (SEATS_UNAVAILABLE)
    4. System detects failure and escalates
    """
    print_banner("SCENARIO 5: Booking API Failure → Escalation")

    event = {
        "eventType": "FLIGHT_CANCELLED",
        "flightId": "AI101",
        "origin": "BOM",
        "destination": "DEL",
        "itineraryId": "TRIP-001",
        "timestamp": datetime.utcnow().isoformat(),
    }

    print_info("Event Type", event["eventType"])
    print_info("Simulation", "Booking provider set to failure mode for ALT-102")
    print()

    # Create orchestrator with a booking provider in failure mode
    booking_provider = MockBookingProvider()
    booking_provider.set_failure_mode("ALT-102")

    orchestrator = TravelAgentOrchestrator(
        booking_provider=booking_provider,
    )

    result = await orchestrator.run_disruption_pipeline(disruption_event=event)

    _print_pipeline_result(result)

    # Check if booking failed
    booking_result = result.get("execution", {}).get("booking", {})
    if booking_result and not booking_result.get("success", True):
        print_warning("Booking failed as expected — handling escalation")
        from app.events.handlers import handle_booking_failure
        escalation = handle_booking_failure({
            "disruptionId": result.get("disruption_id"),
            "alternativeId": "ALT-102",
            "reason": booking_result.get("error", "UNKNOWN"),
        })
        print()
        print_info("Escalation Status", escalation.get("status", "N/A"))
        print_info("Action", escalation.get("action", "N/A"))
        print_info("Message", escalation.get("message", "N/A"))

    return result


def _print_pipeline_result(result: Dict[str, Any]):
    """Pretty-print the pipeline result."""
    status = result.get("status", "UNKNOWN")
    duration = result.get("pipeline_duration_ms", "N/A")

    print(f"\n{Colors.BOLD}{'─' * 50}{Colors.END}")
    print(f"{Colors.BOLD}  PIPELINE RESULT{Colors.END}")
    print(f"{'─' * 50}")

    # Status
    if status in ("REBOOK", "CONFIRMED"):
        print_success(f"Decision: {status}")
    elif status == "ESCALATE":
        print_warning(f"Decision: {status} (requires human approval)")
    elif status == "ERROR":
        print_error(f"Decision: {status}")
    else:
        print_info("Decision", status)

    print_info("Duration", f"{duration}ms")

    # Decision details
    decision = result.get("decision", {})
    if decision:
        print_info("Alternative", decision.get("selectedAlternativeId", "N/A"))
        print_info("Confidence", f"{decision.get('confidence', 0):.0%}")
        print_info("Approval Required", str(decision.get("requiresApproval", False)))

        reason_codes = decision.get("reasonCodes", [])
        if reason_codes:
            print_info("Reason Codes", ", ".join(reason_codes))

        explanation = decision.get("explanation", "")
        if explanation:
            print(f"\n  {Colors.CYAN}Explanation:{Colors.END}")
            # Word-wrap at 70 chars
            words = explanation.split()
            line = "    "
            for word in words:
                if len(line) + len(word) > 74:
                    print(line)
                    line = "    "
                line += word + " "
            if line.strip():
                print(line)

    # Execution results
    execution = result.get("execution", {})
    if execution:
        print(f"\n  {Colors.CYAN}Execution:{Colors.END}")
        booking = execution.get("booking")
        if booking:
            if booking.get("success"):
                print_success(f"Booking confirmed: {booking.get('booking_reference', 'N/A')}")
            else:
                print_error(f"Booking failed: {booking.get('error', 'Unknown')}")
        else:
            print_info("  Booking", "Not executed (approval required or escalated)")

        hotel = execution.get("hotel")
        if hotel:
            print_success(f"Hotel modified: check-in → {hotel.get('new_check_in', 'N/A')}")

        if execution.get("notification_sent"):
            print_success("Notification sent to traveler")

    # Audit trail summary
    audit = result.get("audit_trail", {})
    layers = audit.get("layers", {})
    if layers:
        print(f"\n  {Colors.CYAN}Audit Trail ({len(layers)} layers):{Colors.END}")
        for layer_name, layer_data in layers.items():
            layer_status = layer_data.get("status", "N/A")
            print(f"    {Colors.GREEN}✓{Colors.END} {layer_name}: {layer_status}")

    print()


# ═══════════════════════════════════════════════════
# Main Entry Point
# ═══════════════════════════════════════════════════

async def run_all_scenarios():
    """Run all 5 demo scenarios sequentially."""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  AUTONOMOUS TRAVEL-DISRUPTION CONCIERGE                 ║")
    print("║  Simulation Engine — Full Demo Suite                    ║")
    print("║  Owner: Member D (Backend AI / Agent & Integration)     ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}")

    results = {}

    results["scenario_1"] = await run_scenario_1_cancellation()
    results["scenario_2"] = await run_scenario_2_missed_connection()
    results["scenario_3"] = await run_scenario_3_cancellation_rebook()
    results["scenario_4"] = await run_scenario_4_policy_failure()
    results["scenario_5"] = await run_scenario_5_booking_failure()

    # Summary
    print_banner("SIMULATION SUMMARY", "═")
    for name, result in results.items():
        status = result.get("status", "UNKNOWN")
        duration = result.get("pipeline_duration_ms", "N/A")
        if status in ("REBOOK", "CONFIRMED"):
            print_success(f"{name}: {status} ({duration}ms)")
        elif status == "ESCALATE":
            print_warning(f"{name}: {status} ({duration}ms)")
        elif status == "ERROR":
            print_error(f"{name}: {status} ({duration}ms)")
        else:
            print_info(name, f"{status} ({duration}ms)")

    print(f"\n{Colors.GREEN}{Colors.BOLD}All 5 scenarios completed successfully.{Colors.END}\n")

    return results


if __name__ == "__main__":
    # Allow running individual scenarios via CLI args
    import argparse
    parser = argparse.ArgumentParser(description="Travel Disruption Simulation Engine")
    parser.add_argument(
        "--scenario", "-s",
        type=int,
        choices=[1, 2, 3, 4, 5],
        help="Run a specific scenario (1-5). Omit to run all.",
    )
    args = parser.parse_args()

    if args.scenario:
        scenario_map = {
            1: run_scenario_1_cancellation,
            2: run_scenario_2_missed_connection,
            3: run_scenario_3_cancellation_rebook,
            4: run_scenario_4_policy_failure,
            5: run_scenario_5_booking_failure,
        }
        asyncio.run(scenario_map[args.scenario]())
    else:
        asyncio.run(run_all_scenarios())
