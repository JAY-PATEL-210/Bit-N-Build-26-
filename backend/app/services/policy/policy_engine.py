# Owner: Member C (Backend Lead / Core Services)
# Sections 23 & 24: Deterministic Travel Policy Engine

class PolicyEngine:
    """
    Deterministic rule engine that validates all travel actions.
    AI CANNOT OVERRIDE THIS POLICY ENGINE (Section 24).
    """
    def __init__(self, policy: dict):
        self.max_additional_fare = policy.get("maximumAdditionalFare", 20000)
        self.currency = policy.get("currency", "INR")
        self.max_stops = policy.get("maximumStops", 1)
        self.min_connection_minutes = policy.get("minimumConnectionMinutes", 90)
        self.autonomous_rebooking = policy.get("autonomousRebooking", True)
        self.autonomous_hotel_modification = policy.get("autonomousHotelModification", True)

    def validate_alternative(self, alternative: dict) -> dict:
        """
        Hard constraint check:
        IF fare > policy_limit -> REJECT
        IF stops > max_stops -> REJECT
        """
        fare = alternative.get("additional_fare", 0)
        stops = alternative.get("stops", 0)

        if fare > self.max_additional_fare:
            return {
                "compliant": False,
                "reason": f"Fare exceeds maximum allowed budget of {self.currency} {self.max_additional_fare}"
            }
        
        if stops > self.max_stops:
            return {
                "compliant": False,
                "reason": f"Stops ({stops}) exceeds maximum allowed ({self.max_stops})"
            }

        return {"compliant": True, "reason": "Within policy"}
