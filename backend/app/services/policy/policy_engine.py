# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Policy Engine  --  Deterministic travel policy validation (FR-08)
# AI CANNOT OVERRIDE THIS ENGINE.
# ──────────────────────────────────────────────────────────────────────────────
from typing import List
from app.core.logging import logger


class PolicyResult:
    """Result of a policy check with structured violations list."""
    def __init__(self, compliant: bool, violations: list[str] = None):
        self.compliant = compliant
        self.violations = violations or []

    def to_dict(self):
        return {"compliant": self.compliant, "violations": self.violations}


class PolicyEngine:
    """
    Deterministic rule engine that validates all travel actions.
    Every AI recommendation MUST pass through this gate before execution.
    """

    def __init__(self, policy: dict):
        self.max_additional_fare = policy.get("max_additional_fare", 20000)
        self.currency = policy.get("currency", "INR")
        self.max_stops = policy.get("max_stops", 1)
        self.min_connection_minutes = policy.get("min_connection_minutes", 90)
        self.allowed_cabins = policy.get("allowed_cabins", ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"])
        self.autonomous_rebooking = policy.get("autonomous_rebooking", True)
        self.autonomous_hotel_modification = policy.get("autonomous_hotel_modification", True)

    @classmethod
    def from_preferences(cls, prefs) -> "PolicyEngine":
        """Build a PolicyEngine from a TravelPreferences ORM object."""
        return cls({
            "max_additional_fare": prefs.max_additional_fare,
            "currency": prefs.currency,
            "max_stops": 1,
            "min_connection_minutes": prefs.min_connection_minutes,
            "allowed_cabins": ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"],
            "autonomous_rebooking": prefs.autonomous_rebooking,
            "autonomous_hotel_modification": prefs.autonomous_hotel_modification,
        })

    # ── Core Validation ─────────────────────────────────────────────────────
    def validate_alternative(self, alternative: dict) -> PolicyResult:
        """
        Hard-constraint check against policy rules.
        Returns PolicyResult with detailed violation reasons.
        """
        violations = []

        fare = alternative.get("additional_fare", 0)
        stops = alternative.get("stops", 0)
        connection_min = alternative.get("connection_minutes")
        cabin = alternative.get("cabin")

        # Rule 1: Maximum fare budget
        if fare > self.max_additional_fare:
            violations.append(
                f"Fare {self.currency} {fare:,.0f} exceeds maximum budget of {self.currency} {self.max_additional_fare:,.0f}"
            )

        # Rule 2: Maximum stops
        if stops > self.max_stops:
            violations.append(
                f"Stops ({stops}) exceeds maximum allowed ({self.max_stops})"
            )

        # Rule 3: Minimum connection time
        if connection_min is not None and connection_min < self.min_connection_minutes:
            violations.append(
                f"Connection time ({connection_min} min) is below minimum required ({self.min_connection_minutes} min)"
            )

        # Rule 4: Cabin class
        if cabin and cabin not in self.allowed_cabins:
            violations.append(
                f"Cabin class '{cabin}' is not in allowed list: {self.allowed_cabins}"
            )

        compliant = len(violations) == 0
        result = PolicyResult(compliant=compliant, violations=violations)

        logger.info(
            "POLICY  fare=%s stops=%s -> %s  violations=%d",
            fare, stops, "PASS" if compliant else "FAIL", len(violations),
        )
        return result

    def validate_batch(self, alternatives: list[dict]) -> list[PolicyResult]:
        """Validate a list of alternatives, returning results in same order."""
        return [self.validate_alternative(alt) for alt in alternatives]

    # ── Decision Gate ───────────────────────────────────────────────────────
    def requires_human_approval(self, alternative: dict, ai_confidence: float = 1.0) -> bool:
        """
        Determine if the rebooking action needs traveler approval (FR-10).
        Reasons for escalation:
        1. Alternative is not policy-compliant
        2. AI confidence is below threshold (< 0.7)
        3. Autonomous rebooking is disabled in preferences
        """
        if not self.autonomous_rebooking:
            return True

        result = self.validate_alternative(alternative)
        if not result.compliant:
            return True

        if ai_confidence < 0.7:
            return True

        return False
