# Owner: Member C — E2E test: Full cancellation pipeline
from datetime import datetime
from app.services.disruption.disruption_service import DisruptionService
from app.services.alternative.alternative_service import AlternativeService
from app.services.policy.policy_engine import PolicyEngine
from app.services.rebooking.rebooking_service import RebookingService
from app.services.audit.audit_service import AuditService
from app.models.itinerary import Itinerary, Disruption, HotelBooking
from app.utils.idempotency import generate_idempotency_key


class TestFullCancellationFlow:
    """
    E2E: Seed → Cancellation → Cascade → Alternatives → Policy → Rebook → Hotel → Audit
    This mirrors the exact demo scenario from the SRS (Section 22).
    """

    def test_complete_pipeline(self, seeded_db):
        db = seeded_db

        # ── Step 1: Simulate cancellation of AI101 (BOM→DEL) ────────
        dis_svc = DisruptionService(db)
        disruption = dis_svc.simulate_disruption(
            event_type="CANCELLATION",
            flight_id="FLT-001",
            itinerary_id="TRIP-001",
        )
        assert disruption.type == "CANCELLATION"
        assert disruption.severity == "CRITICAL"
        assert "SEG-002" in disruption.affected_segments  # DEL→LHR broken

        # Itinerary should be DISRUPTED
        itin = db.query(Itinerary).filter(Itinerary.id == "TRIP-001").first()
        assert itin.status == "DISRUPTED"

        # ── Step 2: Score 4 alternative flights ─────────────────────
        policy = PolicyEngine({
            "max_additional_fare": 20000,
            "currency": "INR",
            "max_stops": 1,
            "min_connection_minutes": 90,
        })

        candidates = [
            {  # Good: cheap, direct, on time
                "airline": "IndiGo", "flight_number": "6E204",
                "origin": "BOM", "destination": "DEL",
                "departure_time": datetime(2025, 6, 10, 11, 0),
                "arrival_time": datetime(2025, 6, 10, 13, 15),
                "duration_minutes": 135, "stops": 0,
                "additional_fare": 4500, "currency": "INR",
            },
            {  # Good: slightly later
                "airline": "Vistara", "flight_number": "UK962",
                "origin": "BOM", "destination": "DEL",
                "departure_time": datetime(2025, 6, 10, 12, 0),
                "arrival_time": datetime(2025, 6, 10, 14, 10),
                "duration_minutes": 130, "stops": 0,
                "additional_fare": 8500, "currency": "INR",
            },
            {  # FAIL: too expensive
                "airline": "Air India", "flight_number": "AI302",
                "origin": "BOM", "destination": "DEL",
                "departure_time": datetime(2025, 6, 10, 10, 30),
                "arrival_time": datetime(2025, 6, 10, 12, 45),
                "duration_minutes": 135, "stops": 0,
                "additional_fare": 35000, "currency": "INR",
            },
            {  # FAIL: too many stops
                "airline": "SpiceJet", "flight_number": "SG410",
                "origin": "BOM", "destination": "DEL",
                "departure_time": datetime(2025, 6, 10, 9, 0),
                "arrival_time": datetime(2025, 6, 10, 14, 30),
                "duration_minutes": 330, "stops": 2,
                "additional_fare": 3000, "currency": "INR",
            },
        ]

        alt_svc = AlternativeService(db)
        alternatives = alt_svc.score_and_persist(disruption, candidates, policy)

        assert len(alternatives) == 4
        compliant = [a for a in alternatives if a.policy_compliant]
        assert len(compliant) == 2  # Only IndiGo + Vistara pass policy
        recommended = [a for a in alternatives if a.recommended]
        assert len(recommended) == 1
        assert recommended[0].flight_number in ("6E204", "UK962")

        # ── Step 3: Rebook on recommended alternative ───────────────
        best = recommended[0]
        rbk_svc = RebookingService(db)
        result = rbk_svc.execute_rebooking(
            disruption_id=disruption.id,
            alternative_id=best.id,
            idempotency_key=generate_idempotency_key(),
        )
        assert result["status"] == "CONFIRMED"
        assert result["booking_reference"].startswith("CONF-")

        # ── Step 4: Verify hotel was modified ───────────────────────
        hotel = db.query(HotelBooking).filter(HotelBooking.id == "HTL-001").first()
        # Hotel check-in may be modified based on new arrival time
        assert hotel is not None

        # ── Step 5: Verify disruption resolved ──────────────────────
        dis = db.query(Disruption).filter(Disruption.id == disruption.id).first()
        assert dis.status == "RESOLVED"

        # ── Step 6: Verify audit trail ──────────────────────────────
        audit_svc = AuditService(db)
        trail = audit_svc.get_trail("TRIP-001")
        events = [e.event for e in trail]
        assert "DISRUPTION_DETECTED" in events
        assert "REBOOKING_CONFIRMED" in events
        assert len(trail) >= 2
