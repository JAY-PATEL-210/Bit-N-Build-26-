# Owner: Member C — Unit tests for Deterministic Policy Engine
import pytest
from app.services.policy.policy_engine import PolicyEngine


@pytest.fixture
def default_policy():
    return PolicyEngine({
        "max_additional_fare": 20000,
        "currency": "INR",
        "max_stops": 1,
        "min_connection_minutes": 90,
        "allowed_cabins": ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"],
        "autonomous_rebooking": True,
    })


class TestPolicyEngine:
    """Section 23 & 24: Deterministic policy validation."""

    def test_compliant_alternative(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 5000, "stops": 0
        })
        assert result.compliant is True
        assert len(result.violations) == 0

    def test_fare_exceeds_budget(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 25000, "stops": 0
        })
        assert result.compliant is False
        assert any("Fare" in v for v in result.violations)

    def test_stops_exceed_maximum(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 5000, "stops": 3
        })
        assert result.compliant is False
        assert any("Stops" in v for v in result.violations)

    def test_connection_time_too_short(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 5000, "stops": 0, "connection_minutes": 45
        })
        assert result.compliant is False
        assert any("Connection" in v for v in result.violations)

    def test_invalid_cabin_class(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 5000, "stops": 0, "cabin": "FIRST"
        })
        assert result.compliant is False
        assert any("Cabin" in v for v in result.violations)

    def test_multiple_violations(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 50000, "stops": 5, "connection_minutes": 30
        })
        assert result.compliant is False
        assert len(result.violations) == 3

    def test_exact_budget_boundary(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 20000, "stops": 1
        })
        assert result.compliant is True

    def test_zero_fare(self, default_policy):
        result = default_policy.validate_alternative({
            "additional_fare": 0, "stops": 0
        })
        assert result.compliant is True

    def test_batch_validation(self, default_policy):
        alts = [
            {"additional_fare": 5000, "stops": 0},
            {"additional_fare": 50000, "stops": 3},
        ]
        results = default_policy.validate_batch(alts)
        assert results[0].compliant is True
        assert results[1].compliant is False

    def test_requires_human_approval_disabled(self):
        policy = PolicyEngine({"autonomous_rebooking": False})
        assert policy.requires_human_approval({"additional_fare": 0}) is True

    def test_requires_human_approval_low_confidence(self, default_policy):
        assert default_policy.requires_human_approval(
            {"additional_fare": 5000, "stops": 0}, ai_confidence=0.5
        ) is True

    def test_no_approval_needed_compliant(self, default_policy):
        assert default_policy.requires_human_approval(
            {"additional_fare": 5000, "stops": 0}, ai_confidence=0.9
        ) is False
