# Owner: Member D (Backend AI / Agent & Integration)
# Integration test for the full orchestrator pipeline
import pytest
import asyncio
from app.agents.orchestrator.travel_orchestrator import TravelAgentOrchestrator
from app.agents.context_builder import ContextBuilder
from app.agents.flight_evaluator import FlightEvaluator
from app.agents.decision_agent.decision_agent import DecisionAgent
from app.agents.guardrails import AiGuardrails


def run_async(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


class TestOrchestratorIntegration:
    """
    Integration tests for the full orchestrator pipeline.
    Tests the end-to-end flow from disruption event to decision and execution.
    """

    def test_full_pipeline_cancellation(self):
        """Full pipeline: FLIGHT_CANCELLED -> context -> evaluate -> decide -> guardrails -> execute."""
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

        # Pipeline should complete without error
        assert result["status"] != "ERROR", f"Pipeline failed: {result.get('error')}"

        # Decision should be structured
        decision = result["decision"]
        assert "decision" in decision
        assert "selectedAlternativeId" in decision
        assert "confidence" in decision
        assert "explanation" in decision
        assert "guardrail_result" in decision

        # Guardrails should have passed for a valid decision
        assert decision["guardrail_result"]["passed"] is True

    def test_full_pipeline_delay(self):
        """Full pipeline: FLIGHT_DELAYED -> context with downstream impacts."""
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

        assert result["status"] != "ERROR"
        assert "audit_trail" in result

        # Perception layer should have detected downstream impacts
        perception = result["audit_trail"]["layers"].get("perception", {})
        assert perception.get("status") == "COMPLETE"

    def test_pipeline_audit_trail_completeness(self):
        """Audit trail must contain all 6 pipeline layers."""
        orchestrator = TravelAgentOrchestrator()
        result = run_async(orchestrator.run_disruption_pipeline(
            disruption_event={
                "eventType": "FLIGHT_CANCELLED",
                "flightId": "AI101",
                "itineraryId": "TRIP-001",
            }
        ))

        layers = result["audit_trail"]["layers"]
        expected_layers = {
            "perception", "reasoning", "policy",
            "action_preparation", "verification", "execution"
        }
        assert expected_layers.issubset(set(layers.keys())), (
            f"Missing layers: {expected_layers - set(layers.keys())}"
        )

        # All layers should be COMPLETE
        for layer_name, layer_data in layers.items():
            assert layer_data.get("status") == "COMPLETE", (
                f"Layer {layer_name} is not COMPLETE: {layer_data}"
            )

    def test_context_builder_standalone(self):
        """ContextBuilder should produce valid structured context."""
        builder = ContextBuilder()
        context = builder.build_disruption_context(
            disruption_event={
                "eventType": "FLIGHT_CANCELLED",
                "flightId": "AI101",
                "itineraryId": "TRIP-001",
            },
            itinerary={
                "id": "TRIP-001",
                "segments": [
                    {"flight_id": "AI101", "origin": "BOM", "destination": "DEL"},
                    {"flight_id": "AI203", "origin": "DEL", "destination": "LHR"},
                ],
                "hotel": {"hotel_id": "HTL-001", "name": "London Grand Hotel"},
            },
            policy={"maximumAdditionalFare": 20000},
            candidate_alternatives=[{"id": "ALT-102"}],
        )

        assert context["disruption"]["event_type"] == "FLIGHT_CANCELLED"
        assert context["disruption"]["flight_id"] == "AI101"
        assert len(context["affected_segments"]) > 0
        assert len(context["downstream_impacts"]) > 0
        assert context["metadata"]["total_candidates"] == 1

    def test_flight_evaluator_scoring(self):
        """FlightEvaluator should properly score and sort candidates."""
        evaluator = FlightEvaluator()
        candidates = [
            {"id": "ALT-101", "additional_fare": 35000, "stops": 1, "airline": "Air India"},
            {"id": "ALT-102", "additional_fare": 8500, "stops": 1, "airline": "Air India"},
        ]
        policy = {"maximumAdditionalFare": 20000, "maximumStops": 1}

        scored = evaluator.evaluate_alternatives(candidates, policy)

        assert len(scored) == 2
        # ALT-102 should be compliant and first
        compliant = evaluator.get_compliant_alternatives(scored)
        assert len(compliant) == 1
        assert compliant[0]["id"] == "ALT-102"

        # ALT-101 should be non-compliant
        non_compliant = [s for s in scored if not s["policy_compliant"]]
        assert len(non_compliant) == 1
        assert non_compliant[0]["id"] == "ALT-101"

    def test_decision_then_guardrails_integration(self):
        """Decision agent output should pass guardrails when valid."""
        agent = DecisionAgent(api_key=None)
        guardrails = AiGuardrails()

        candidates = [
            {"id": "ALT-102", "additional_fare": 8500, "stops": 1, "score": 0.9, "policy_compliant": True,
             "airline": "Air India", "flight_number": "AI203", "departure_time": "20:30", "arrival_time": "05:45"},
        ]
        policy = {"maximumAdditionalFare": 20000, "maximumStops": 1, "autonomousRebooking": True}

        decision = agent.evaluate(candidates, policy)
        decision_dict = decision.model_dump()

        is_valid, violations = guardrails.validate_decision(
            decision_dict, candidates, policy
        )
        assert is_valid is True, f"Guardrail violations: {violations}"
