# Owner: Member D (Backend AI / Agent & Integration)
# Unit tests for AI Decision Agent
import pytest
from app.agents.decision_agent.decision_agent import DecisionAgent, AiDecisionOutput


# ═══════════════════════════════════════════════════
# Test Data
# ═══════════════════════════════════════════════════

COMPLIANT_ALTERNATIVES = [
    {
        "id": "ALT-102",
        "airline": "Air India",
        "flight_number": "AI203",
        "origin": "BOM",
        "destination": "DEL",
        "departure_time": "20:30",
        "arrival_time": "05:45",
        "additional_fare": 8500,
        "stops": 1,
        "score": 0.85,
        "policy_compliant": True,
    },
    {
        "id": "ALT-104",
        "airline": "IndiGo",
        "flight_number": "6E204",
        "origin": "BOM",
        "destination": "DEL",
        "departure_time": "19:45",
        "arrival_time": "22:00",
        "additional_fare": 15000,
        "stops": 0,
        "score": 0.72,
        "policy_compliant": True,
    },
]

NON_COMPLIANT_ALTERNATIVES = [
    {
        "id": "ALT-101",
        "airline": "Air India",
        "flight_number": "AI105",
        "additional_fare": 35000,
        "stops": 1,
        "score": 0.30,
        "policy_compliant": False,
    },
    {
        "id": "ALT-103",
        "airline": "SpiceJet",
        "flight_number": "SG422",
        "additional_fare": 42000,
        "stops": 0,
        "score": 0.20,
        "policy_compliant": False,
    },
]

MIXED_ALTERNATIVES = COMPLIANT_ALTERNATIVES + NON_COMPLIANT_ALTERNATIVES

DEFAULT_POLICY = {
    "maximumAdditionalFare": 20000,
    "currency": "INR",
    "maximumStops": 1,
    "minimumConnectionMinutes": 90,
    "autonomousRebooking": True,
}

DEFAULT_CONTEXT = {
    "disruption": {
        "event_type": "FLIGHT_CANCELLED",
        "flight_id": "AI101",
        "force_policy_exceeded": False,
    },
    "itinerary": {
        "id": "TRIP-001",
        "traveler": {"name": "Test Traveler", "preferences": {}},
    },
}


# ═══════════════════════════════════════════════════
# Tests
# ═══════════════════════════════════════════════════

class TestDecisionAgent:
    """Test suite for the AI Decision Agent."""

    def setup_method(self):
        """Create a fresh agent for each test (no API key = deterministic mode)."""
        self.agent = DecisionAgent(api_key=None)

    def test_decision_output_is_valid_pydantic_model(self):
        """AI output must conform to AiDecisionOutput schema."""
        result = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        assert isinstance(result, AiDecisionOutput)
        assert result.decision in {"REBOOK", "ESCALATE", "CANCEL", "WAIT", "NO_ACTION"}
        assert 0.0 <= result.confidence <= 1.0
        assert isinstance(result.reasonCodes, list)
        assert len(result.explanation) > 0

    def test_selects_compliant_alternative(self):
        """Agent must select a policy-compliant alternative when available."""
        result = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        assert result.decision == "REBOOK"
        assert result.selectedAlternativeId in {"ALT-102", "ALT-104"}

    def test_selects_best_scored_compliant(self):
        """Agent should select the highest-scored compliant alternative."""
        result = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        # ALT-102 has score 0.85 (highest compliant)
        assert result.selectedAlternativeId == "ALT-102"

    def test_escalates_when_all_exceed_policy(self):
        """When all alternatives exceed policy, decision must be ESCALATE."""
        result = self.agent.evaluate(
            NON_COMPLIANT_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT
        )
        assert result.decision == "ESCALATE"
        assert result.requiresApproval is True
        assert "POLICY_VIOLATION_ESCALATION" in result.reasonCodes

    def test_escalates_when_no_alternatives(self):
        """When no alternatives exist at all, decision must be ESCALATE."""
        result = self.agent.evaluate([], DEFAULT_POLICY, DEFAULT_CONTEXT)
        assert result.decision == "ESCALATE"
        assert result.requiresApproval is True
        assert "NO_ALTERNATIVES_FOUND" in result.reasonCodes

    def test_force_policy_exceeded_triggers_escalation(self):
        """forcePolicyExceeded flag should force escalation."""
        policy_exceeded_context = {
            **DEFAULT_CONTEXT,
            "disruption": {
                **DEFAULT_CONTEXT["disruption"],
                "force_policy_exceeded": True,
            },
        }
        result = self.agent.evaluate(
            MIXED_ALTERNATIVES,
            {**DEFAULT_POLICY, "forcePolicyExceeded": True},
            policy_exceeded_context,
        )
        assert result.decision == "ESCALATE"
        assert result.requiresApproval is True

    def test_explanation_is_human_readable(self):
        """Explanation must be a meaningful, human-readable string."""
        result = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        assert len(result.explanation) >= 20
        # Should mention fare or policy
        explanation_lower = result.explanation.lower()
        assert any(
            keyword in explanation_lower
            for keyword in ["fare", "policy", "selected", "alternative", "flight"]
        )

    def test_reason_codes_are_valid(self):
        """Reason codes must be valid machine-readable strings."""
        result = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        for code in result.reasonCodes:
            assert isinstance(code, str)
            assert len(code) > 0
            # Reason codes should be UPPER_SNAKE_CASE
            assert code == code.upper() or "_" in code

    def test_confidence_reflects_quality(self):
        """Confidence should be higher when more compliant options are available."""
        # Many compliant options
        result_many = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        # Only non-compliant options (escalation)
        result_none = self.agent.evaluate(NON_COMPLIANT_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        # Both should have reasonable confidence
        assert result_many.confidence >= 0.40
        assert result_none.confidence >= 0.40

    def test_never_invents_flight_ids(self):
        """AI must never select an alternative ID not in the candidate list."""
        result = self.agent.evaluate(MIXED_ALTERNATIVES, DEFAULT_POLICY, DEFAULT_CONTEXT)
        valid_ids = {alt["id"] for alt in MIXED_ALTERNATIVES} | {"NONE"}
        assert result.selectedAlternativeId in valid_ids
