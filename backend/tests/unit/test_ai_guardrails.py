# Owner: Member D (Backend AI / Agent & Integration)
# Unit tests for AI Guardrails — Hallucination prevention & safety validation
import pytest
from app.agents.guardrails import AiGuardrails


# ═══════════════════════════════════════════════════
# Test Data
# ═══════════════════════════════════════════════════

CANDIDATE_ALTERNATIVES = [
    {
        "id": "ALT-102",
        "airline": "Air India",
        "flight_number": "AI203",
        "additional_fare": 8500,
        "stops": 1,
    },
    {
        "id": "ALT-104",
        "airline": "IndiGo",
        "flight_number": "6E204",
        "additional_fare": 15000,
        "stops": 0,
    },
    {
        "id": "ALT-101",
        "airline": "Air India",
        "flight_number": "AI105",
        "additional_fare": 35000,
        "stops": 1,
    },
]

DEFAULT_POLICY = {
    "maximumAdditionalFare": 20000,
    "currency": "INR",
    "maximumStops": 1,
}

VALID_DECISION = {
    "decision": "REBOOK",
    "selectedAlternativeId": "ALT-102",
    "confidence": 0.92,
    "requiresApproval": False,
    "reasonCodes": ["WITHIN_FARE_LIMIT", "EARLIEST_ELIGIBLE_ARRIVAL"],
    "explanation": "Selected ALT-102 as it provides the best compliant option within fare policy.",
}


# ═══════════════════════════════════════════════════
# Tests
# ═══════════════════════════════════════════════════

class TestAiGuardrails:
    """Test suite for AI Guardrails."""

    def setup_method(self):
        self.guardrails = AiGuardrails()

    def test_valid_decision_passes(self):
        """A fully valid decision should pass all guardrails."""
        is_valid, violations = self.guardrails.validate_decision(
            VALID_DECISION, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is True
        assert len(violations) == 0

    def test_hallucinated_flight_id_rejected(self):
        """AI selecting a flight ID not in the candidate list must be rejected."""
        hallucinated = {
            **VALID_DECISION,
            "selectedAlternativeId": "FAKE-999",  # Does not exist
        }
        is_valid, violations = self.guardrails.validate_decision(
            hallucinated, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("HALLUCINATED" in v for v in violations)

    def test_missing_required_fields_rejected(self):
        """Decision missing required fields must be rejected."""
        incomplete = {
            "decision": "REBOOK",
            # Missing: selectedAlternativeId, confidence, explanation, etc.
        }
        is_valid, violations = self.guardrails.validate_decision(
            incomplete, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("MISSING_FIELDS" in v for v in violations)

    def test_invalid_decision_type_rejected(self):
        """Invalid decision type must be rejected."""
        bad_decision = {
            **VALID_DECISION,
            "decision": "YOLO_BOOK_IT",  # Not a valid decision type
        }
        is_valid, violations = self.guardrails.validate_decision(
            bad_decision, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("INVALID_DECISION" in v for v in violations)

    def test_confidence_out_of_range_rejected(self):
        """Confidence outside [0, 1] must be rejected."""
        over_confident = {
            **VALID_DECISION,
            "confidence": 1.5,
        }
        is_valid, violations = self.guardrails.validate_decision(
            over_confident, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("CONFIDENCE_OUT_OF_RANGE" in v for v in violations)

    def test_low_confidence_without_approval_rejected(self):
        """Low confidence REBOOK without requiresApproval must be rejected."""
        low_conf = {
            **VALID_DECISION,
            "confidence": 0.30,
            "requiresApproval": False,
        }
        is_valid, violations = self.guardrails.validate_decision(
            low_conf, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("LOW_CONFIDENCE" in v for v in violations)

    def test_low_confidence_with_approval_passes(self):
        """Low confidence with requiresApproval=True should pass."""
        low_conf_approved = {
            **VALID_DECISION,
            "confidence": 0.50,
            "requiresApproval": True,
        }
        is_valid, violations = self.guardrails.validate_decision(
            low_conf_approved, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is True

    def test_empty_explanation_rejected(self):
        """Empty or too-short explanation must be rejected."""
        no_explanation = {
            **VALID_DECISION,
            "explanation": "ok",  # Too short
        }
        is_valid, violations = self.guardrails.validate_decision(
            no_explanation, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("INSUFFICIENT_EXPLANATION" in v for v in violations)

    def test_policy_violating_selection_flagged(self):
        """Selecting an alternative that exceeds fare policy must be flagged."""
        expensive = {
            **VALID_DECISION,
            "selectedAlternativeId": "ALT-101",  # fare=35000 > 20000
        }
        is_valid, violations = self.guardrails.validate_decision(
            expensive, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert is_valid is False
        assert any("POLICY_VIOLATION" in v for v in violations)

    def test_enforce_guardrails_overrides_to_escalate(self):
        """enforce_guardrails must override a bad decision to ESCALATE."""
        hallucinated = {
            **VALID_DECISION,
            "selectedAlternativeId": "FAKE-999",
        }
        result = self.guardrails.enforce_guardrails(
            hallucinated, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert result["decision"] == "ESCALATE"
        assert result["requiresApproval"] is True
        assert "GUARDRAIL_VIOLATION" in result["reasonCodes"]
        assert result["guardrail_result"]["passed"] is False

    def test_enforce_guardrails_passes_valid(self):
        """enforce_guardrails must pass through a valid decision unchanged."""
        result = self.guardrails.enforce_guardrails(
            VALID_DECISION, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        assert result["decision"] == "REBOOK"
        assert result["guardrail_result"]["passed"] is True
        assert len(result["guardrail_result"]["violations"]) == 0

    def test_escalate_decision_with_nonexistent_id_passes(self):
        """ESCALATE decisions may reference non-compliant alternatives."""
        escalate = {
            **VALID_DECISION,
            "decision": "ESCALATE",
            "selectedAlternativeId": "ALT-101",
            "requiresApproval": True,
        }
        is_valid, violations = self.guardrails.validate_decision(
            escalate, CANDIDATE_ALTERNATIVES, DEFAULT_POLICY
        )
        # ESCALATE with a valid (but expensive) alternative — should pass schema
        # but may flag policy violation
        # The key test is that ESCALATE is a valid decision type
        assert "INVALID_DECISION" not in " ".join(violations)
