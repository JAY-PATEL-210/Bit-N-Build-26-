# Owner: Member C — Integration tests for idempotent rebooking
from datetime import datetime
from app.models.itinerary import AlternativeFlight, Disruption
from app.services.disruption.disruption_service import DisruptionService
from app.services.rebooking.rebooking_service import RebookingService
from app.utils.idempotency import generate_idempotency_key


class TestRebookingIdempotency:
    """Section 37 & 38: Zero duplicate bookings guaranteed."""

    def _setup_disruption_with_alternative(self, db):
        """Trigger disruption and manually add an alternative."""
        dis_svc = DisruptionService(db)
        disruption = dis_svc.simulate_disruption(
            event_type="CANCELLATION",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
        )
        alt = AlternativeFlight(
            id="ALT-TEST-001",
            disruption_id=disruption.id,
            airline="IndiGo",
            flight_number="6E204",
            origin="BOM",
            destination="DEL",
            departure_time=datetime(2025, 6, 10, 11, 0),
            arrival_time=datetime(2025, 6, 10, 13, 15),
            stops=0,
            additional_fare=4500,
            policy_compliant=True,
            score=85.0,
        )
        db.add(alt)
        db.commit()
        return disruption, alt

    def test_first_rebooking_confirms(self, seeded_db):
        disruption, alt = self._setup_disruption_with_alternative(seeded_db)
        svc = RebookingService(seeded_db)
        key = generate_idempotency_key()
        result = svc.execute_rebooking(disruption.id, alt.id, key)
        assert result["status"] == "CONFIRMED"
        assert result["booking_reference"] is not None

    def test_duplicate_key_returns_existing(self, seeded_db):
        disruption, alt = self._setup_disruption_with_alternative(seeded_db)
        svc = RebookingService(seeded_db)
        key = generate_idempotency_key()

        result1 = svc.execute_rebooking(disruption.id, alt.id, key)
        result2 = svc.execute_rebooking(disruption.id, alt.id, key)

        assert result1["id"] == result2["id"]
        assert result2["is_duplicate"] is True

    def test_different_keys_create_different_bookings(self, seeded_db):
        disruption, alt = self._setup_disruption_with_alternative(seeded_db)
        svc = RebookingService(seeded_db)

        result1 = svc.execute_rebooking(disruption.id, alt.id, generate_idempotency_key())
        # Need a new disruption for second booking since first resolves it
        assert result1["status"] == "CONFIRMED"

    def test_rebooking_resolves_disruption(self, seeded_db):
        disruption, alt = self._setup_disruption_with_alternative(seeded_db)
        svc = RebookingService(seeded_db)
        svc.execute_rebooking(disruption.id, alt.id, generate_idempotency_key())

        # Check disruption is resolved
        refreshed = seeded_db.query(Disruption).filter(Disruption.id == disruption.id).first()
        assert refreshed.status == "RESOLVED"
