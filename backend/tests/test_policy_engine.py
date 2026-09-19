# Test suite for deterministic policy enforcement (Section 23, 24)
# Updated to use new PolicyResult API
from app.services.policy.policy_engine import PolicyEngine


def test_fare_exceeding_policy_rejected():
    policy = {"max_additional_fare": 20000, "max_stops": 1}
    engine = PolicyEngine(policy)

    expensive_flight = {"additional_fare": 25000, "stops": 0}
    res = engine.validate_alternative(expensive_flight)

    assert res.compliant is False
    assert any("Fare" in v for v in res.violations)


def test_fare_within_policy_accepted():
    policy = {"max_additional_fare": 20000, "max_stops": 1}
    engine = PolicyEngine(policy)

    good_flight = {"additional_fare": 8500, "stops": 1}
    res = engine.validate_alternative(good_flight)

    assert res.compliant is True
