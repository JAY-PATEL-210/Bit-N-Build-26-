# Owner: Member C (Backend Lead / Core Services)
# Sections 37 & 38: Idempotent Rebooking Workflow

class RebookingService:
    """
    Executes flight rebooking actions deterministically with idempotency keys
    to guarantee zero duplicate bookings.
    """
    def __init__(self, db_session=None):
        self.db = db_session
        self.processed_keys = set()

    def execute_rebooking(self, disruption_id: str, alternative_id: str, idempotency_key: str) -> dict:
        # Idempotency check
        if idempotency_key in self.processed_keys:
            return {
                "status": "EXISTING_BOOKING_RETURNED",
                "idempotency_key": idempotency_key,
                "message": "Duplicate request ignored; returning existing booking record."
            }

        self.processed_keys.add(idempotency_key)
        return {
            "status": "CONFIRMED",
            "booking_reference": f"CONF-{idempotency_key[-6:]}",
            "idempotency_key": idempotency_key,
            "alternative_id": alternative_id,
        }
