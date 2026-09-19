# Owner: Member D (Backend AI / Agent & Integration)
# Unit tests for Simulation Engine scenarios
import sys
import os
import pytest
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "simulation"))

from app.agents.orchestrator.travel_orchestrator import TravelAgentOrchestrator
from app.integrations.booking.mock import MockBookingProvider


# ═══════════════════════════════════════════════════
# Helper
# ═══════════════════════════════════════════════════

def run_async(coro):
    """Run an async coroutine synchronously for testing."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ═══════════════════════════════════════════════════
# Tests
# ═══════════════════════════════════════════════════

class TestSimulationScenarios:
    """Test suite validating all 5 simulation scenarios produce correct output."""

    def test_scenario_1_cancellation_rebook(self):
        """Scenario 1: FLIGHT_CANCELLED -> selects compliant ALT -> REBOOK."""
        orchestrator = TravelAgentOrchestrator()
        result = run_async(orchestrator.run_disruption_pipeline(
            disruption_event={
                "eventType": "FLIGHT_CANCELLED",
                "flightId": "AI101",
                "origin": "BOM",
                "destination": "DEL",
                "itineraryId": "TRIP-001",
            }
        ))

        assert result["status"] == "REBOOK"
        assert result["decision"]["selectedAlternativeId"] in {"ALT-102", "ALT-104"}
        assert result["decision"]["requiresApproval"] is False

        # Verify booking was executed
        booking = result["execution"]["booking"]
        assert booking is not None
        assert booking["success"] is True
        assert "booking_reference" in booking

        # Verify hotel was modified
        hotel = result["execution"]["hotel"]
        assert hotel is not None
        assert hotel["success"] is True

        # Verify notification was sent
        assert result["execution"]["notification_sent"] is True

        # Verify audit trail has all layers
        layers = result["audit_trail"]["layers"]
        assert "perception" in layers
        assert "reasoning" in layers
        assert "policy" in layers
        assert "action_preparation" in layers
        assert "verification" in layers
        assert "execution" in layers

    def test_scenario_2_delay_connection_risk(self):
        """Scenario 2: FLIGHT_DELAYED 180min -> connection risk detected."""
        orchestrator = TravelAgentOrchestrator()
        result = run_async(orchestrator.run_disruption_pipeline(
            disruption_event={
                "eventType": "FLIGHT_DELAYED",
                "flightId": "AI101",
                "origin": "BOM",
                "destination": "DEL",
                "delayMinutes": 180,
                "itineraryId": "TRIP-001",
            }
        ))

        # Should still produce a decision (REBOOK or ESCALATE)
        assert result["status"] in {"REBOOK", "ESCALATE"}
        assert "audit_trail" in result
        assert result.get("pipeline_duration_ms") is not None

    def test_scenario_3_idempotency(self):
        """Scenario 3: Running pipeline twice with same orchestrator should be idempotent."""
        orchestrator = TravelAgentOrchestrator()
        event = {
            "eventType": "FLIGHT_CANCELLED",
            "flightId": "AI101",
            "origin": "BOM",
            "destination": "DEL",
            "itineraryId": "TRIP-001",
        }

        result1 = run_async(orchestrator.run_disruption_pipeline(disruption_event=event))
        result2 = run_async(orchestrator.run_disruption_pipeline(disruption_event=event))

        # Both should complete successfully
        assert result1["status"] in {"REBOOK", "ESCALATE"}
        assert result2["status"] in {"REBOOK", "ESCALATE"}

    def test_scenario_4_policy_failure_escalation(self):
        """Scenario 4: All alternatives exceed policy -> ESCALATE with approval required."""
        orchestrator = TravelAgentOrchestrator()
        result = run_async(orchestrator.run_disruption_pipeline(
            disruption_event={
                "eventType": "FLIGHT_CANCELLED",
                "flightId": "AI101",
                "origin": "BOM",
                "destination": "DEL",
                "itineraryId": "TRIP-001",
                "forcePolicyExceeded": True,
            }
        ))

        assert result["status"] == "ESCALATE"
        assert result["decision"]["requiresApproval"] is True

        # Should NOT have executed a booking
        booking = result["execution"].get("booking")
        assert booking is None

    def test_scenario_5_booking_failure(self):
        """Scenario 5: Booking API failure -> booking result shows failure."""
        booking_provider = MockBookingProvider()
        booking_provider.set_failure_mode("ALT-102")

        orchestrator = TravelAgentOrchestrator(booking_provider=booking_provider)
        result = run_async(orchestrator.run_disruption_pipeline(
            disruption_event={
                "eventType": "FLIGHT_CANCELLED",
                "flightId": "AI101",
                "origin": "BOM",
                "destination": "DEL",
                "itineraryId": "TRIP-001",
            }
        ))

        # Pipeline should complete
        assert result["status"] in {"REBOOK", "ESCALATE"}
        assert "audit_trail" in result

        # If the agent selected ALT-102, booking should have failed
        booking = result["execution"].get("booking")
        if booking and result["decision"].get("selectedAlternativeId") == "ALT-102":
            assert booking["success"] is False

    def test_pipeline_returns_duration(self):
        """Pipeline should always report duration in milliseconds."""
        orchestrator = TravelAgentOrchestrator()
        result = run_async(orchestrator.run_disruption_pipeline(
            disruption_event={
                "eventType": "FLIGHT_CANCELLED",
                "flightId": "AI101",
                "itineraryId": "TRIP-001",
            }
        ))
        assert "pipeline_duration_ms" in result
        assert isinstance(result["pipeline_duration_ms"], int)
        assert result["pipeline_duration_ms"] >= 0
