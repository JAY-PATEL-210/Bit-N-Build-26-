from app.integrations.hotel.base import HotelProviderBase
from datetime import datetime
import logging

logger = logging.getLogger("AutonomousTravelConcierge.MockHotel")


class MockHotelProvider(HotelProviderBase):
    """
    Mock hotel provider for demo scenarios.
    Handles check-in delay adjustments when flights are disrupted (Section 39).
    """

    def __init__(self):
        self._reservations = {
            "HTL-001": {
                "hotel_id": "HTL-001",
                "name": "London Grand Hotel",
                "city": "London",
                "check_in": "2026-06-11",
                "check_out": "2026-06-14",
                "status": "CONFIRMED",
                "room_type": "Deluxe King",
            }
        }

    def modify_reservation(
        self, hotel_id: str, new_check_in: str, new_check_out: str
    ) -> dict:
        """Modify hotel reservation dates."""
        reservation = self._reservations.get(hotel_id)
        old_check_in = "N/A"

        if reservation:
            old_check_in = reservation.get("check_in", "N/A")
            reservation["check_in"] = new_check_in
            reservation["check_out"] = new_check_out
            reservation["status"] = "MODIFIED"

        result = {
            "success": True,
            "hotel_id": hotel_id,
            "old_check_in": old_check_in,
            "new_check_in": new_check_in,
            "new_check_out": new_check_out,
            "status": "MODIFIED",
            "timestamp": datetime.utcnow().isoformat(),
        }

        logger.info(
            "[MOCK HOTEL] Reservation %s modified: check-in %s -> %s",
            hotel_id, old_check_in, new_check_in,
        )

        return result

    def cancel_reservation(self, hotel_id: str) -> dict:
        """Cancel a hotel reservation."""
        reservation = self._reservations.get(hotel_id)
        if reservation:
            reservation["status"] = "CANCELLED"

        logger.info("[MOCK HOTEL] Reservation %s cancelled", hotel_id)
        return {
            "success": True,
            "hotel_id": hotel_id,
            "status": "CANCELLED",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_reservation(self, hotel_id: str) -> dict:
        """Get current reservation details."""
        reservation = self._reservations.get(hotel_id)
        if reservation:
            return {"success": True, **reservation}
        return {
            "success": False,
            "hotel_id": hotel_id,
            "error": "Reservation not found",
        }
