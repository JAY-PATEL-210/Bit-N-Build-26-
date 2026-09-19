# Owner: Member C — Unit tests for Disruption cascade analysis
from app.services.disruption.disruption_service import DisruptionService


class TestDisruptionCascade:
    """FR-04, FR-05: Disruption detection and downstream impact."""

    def test_cancellation_creates_disruption(self, seeded_db):
        svc = DisruptionService(seeded_db)
        disruption = svc.simulate_disruption(
            event_type="CANCELLATION",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
        )
        assert disruption.type == "CANCELLATION"
        assert disruption.severity == "CRITICAL"
        assert disruption.status == "ACTIVE"

    def test_cancellation_marks_downstream_segments(self, seeded_db):
        svc = DisruptionService(seeded_db)
        disruption = svc.simulate_disruption(
            event_type="CANCELLATION",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
        )
        # SEG-002 (DEL→LHR) should be affected
        assert disruption.affected_segments is not None
        assert "SEG-002" in disruption.affected_segments

    def test_cancellation_marks_itinerary_disrupted(self, seeded_db):
        from app.models.itinerary import Itinerary
        svc = DisruptionService(seeded_db)
        svc.simulate_disruption(
            event_type="CANCELLATION",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
        )
        itin = seeded_db.query(Itinerary).filter(Itinerary.id == "TRIP-001").first()
        assert itin.status == "DISRUPTED"

    def test_cancellation_impact_mentions_hotel(self, seeded_db):
        svc = DisruptionService(seeded_db)
        disruption = svc.simulate_disruption(
            event_type="CANCELLATION",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
        )
        assert "Hilton" in disruption.impact

    def test_delay_creates_disruption(self, seeded_db):
        svc = DisruptionService(seeded_db)
        disruption = svc.simulate_disruption(
            event_type="DELAY",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
            delay_minutes=30,
        )
        assert disruption.type == "DELAY"
        assert disruption.severity == "LOW"

    def test_major_delay_becomes_missed_connection(self, seeded_db):
        svc = DisruptionService(seeded_db)
        disruption = svc.simulate_disruption(
            event_type="DELAY",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
            delay_minutes=200,  # 12:30+200min = 15:50, past DEL→LHR departure at 15:00
        )
        # Should be upgraded to MISSED_CONNECTION since gap < 90 min
        assert disruption.type == "MISSED_CONNECTION"
        assert disruption.severity == "CRITICAL"
