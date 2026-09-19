# Test suite for deterministic policy enforcement (Section 23, 24)
from app.services.policy.policy_engine import PolicyEngine

def test_fare_exceeding_policy_rejected():
    policy = {"maximumAdditionalFare": 20000, "maximumStops": 1}
    engine = PolicyEngine(policy)
    
    expensive_flight = {"additional_fare": 25000, "stops": 0}
    res = engine.validate_alternative(expensive_flight)
    
    assert res["compliant"] is False
    assert "exceeds maximum" in res["reason"]

def test_fare_within_policy_accepted():
    policy = {"maximumAdditionalFare": 20000, "maximumStops": 1}
    engine = PolicyEngine(policy)
    
    good_flight = {"additional_fare": 8500, "stops": 1}
    res = engine.validate_alternative(good_flight)
    
    assert res["compliant"] is True
