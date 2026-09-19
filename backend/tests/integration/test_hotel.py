# Owner: Member C — Integration tests for hotel modification after rebooking
from datetime import datetime
from app.services.hotel.hotel_service import HotelService
from app.models.itinerary import HotelBooking


class TestHotelModification:
    """FR-11: Automatic hotel check-in adjustment."""

    def test_checkin_adjusted_for_later_arrival(self, seeded_db):
        svc = HotelService(seeded_db)
        new_arrival = datetime(2025, 6, 11, 18, 0)  # Next day
        mods = svc.recalculate_checkin("TRIP-001", new_arrival)
        assert len(mods) == 1
        assert mods[0]["action"] == "MODIFY_CHECKIN"

    def test_late_night_arrival_shifts_to_next_day(self, seeded_db):
        svc = HotelService(seeded_db)
        new_arrival = datetime(2025, 6, 10, 23, 30)  # Late night
        mods = svc.recalculate_checkin("TRIP-001", new_arrival)
        assert mods[0]["action"] == "MODIFY_CHECKIN"
        # Check-in should be June 11 (next day), not June 10
        assert "11 Jun" in mods[0]["new_checkin"] or "2025-06-11" in mods[0]["new_checkin"]

    def test_hotel_status_updated(self, seeded_db):
        svc = HotelService(seeded_db)
        new_arrival = datetime(2025, 6, 11, 15, 0)
        svc.recalculate_checkin("TRIP-001", new_arrival)
        hotel = seeded_db.query(HotelBooking).filter(HotelBooking.id == "HTL-001").first()
        assert hotel.status == "MODIFIED"
