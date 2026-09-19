# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Disruption Service  --  Detection, classification & cascade analysis
#                        (FR-04, FR-05)
# ──────────────────────────────────────────────────────────────────────────────
from datetime import timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.itinerary import (
    Disruption, Flight, TravelSegment, Itinerary, HotelBooking,
)
from app.repositories.disruption_repository import DisruptionRepository
from app.services.flight_monitor.flight_monitor_service import FlightMonitorService
from app.services.audit.audit_service import AuditService
from app.utils.idempotency import generate_id
from app.utils.time import minutes_between
from app.core.logging import logger


class DisruptionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DisruptionRepository(db)
        self.flight_svc = FlightMonitorService(db)
        self.audit_svc = AuditService(db)

    def get_all_active(self) -> List[Disruption]:
        return self.repo.get_active()

    def get_by_id(self, disruption_id: str) -> Optional[Disruption]:
        return self.repo.get_by_id(disruption_id)

    def get_by_itinerary(self, itinerary_id: str) -> List[Disruption]:
        return self.repo.get_by_itinerary(itinerary_id)

    def get_alternatives(self, disruption_id: str):
        return self.repo.get_alternatives(disruption_id)

    # ── Simulate / Trigger Disruption ───────────────────────────────────────
    def simulate_disruption(
        self,
        event_type: str,
        flight_id: str,
        itinerary_id: str,
        delay_minutes: int = 0,
    ) -> Disruption:
        """
        Core disruption pipeline:
        1. Update the flight status
        2. Classify disruption type & severity
        3. Analyze downstream cascade (connecting flights + hotel)
        4. Create Disruption record
        5. Update itinerary status
        6. Log audit entry
        """
        # Step 1: Find and update the flight
        flight = self.db.query(Flight).filter(Flight.id == flight_id).first()
        if not flight:
            raise ValueError(f"Flight {flight_id} not found")

        segment = self.db.query(TravelSegment).filter(TravelSegment.id == flight.segment_id).first()
        if not segment:
            raise ValueError(f"Segment for flight {flight_id} not found")

        # Map event type to flight status
        if event_type.upper() in ("CANCELLATION", "FLIGHT_CANCELLED"):
            flight.status = "CANCELLED"
            disruption_type = "CANCELLATION"
            severity = "CRITICAL"
        elif event_type.upper() in ("DELAY", "FLIGHT_DELAYED"):
            flight.status = "DELAYED"
            if flight.scheduled_departure:
                flight.estimated_departure = flight.scheduled_departure + timedelta(minutes=delay_minutes)
            if flight.scheduled_arrival:
                flight.estimated_arrival = flight.scheduled_arrival + timedelta(minutes=delay_minutes)
            disruption_type = "DELAY"
            severity = "HIGH" if delay_minutes >= 120 else "MEDIUM" if delay_minutes >= 60 else "LOW"
        else:
            disruption_type = "UNKNOWN"
            severity = "MEDIUM"

        self.db.commit()

        # Step 2 & 3: Cascade analysis
        impact_summary, affected_segment_ids = self._analyze_cascade(
            itinerary_id, segment, flight, disruption_type, delay_minutes,
        )

        # Upgrade severity to CRITICAL if downstream connection is broken
        if affected_segment_ids:
            severity = "CRITICAL"
            if disruption_type == "DELAY":
                disruption_type = "MISSED_CONNECTION"

        # Step 4: Create disruption record
        disruption = Disruption(
            id=generate_id("DIS-"),
            itinerary_id=itinerary_id,
            segment_id=segment.id,
            type=disruption_type,
            severity=severity,
            source="SIMULATION",
            description=self._build_description(flight, disruption_type, delay_minutes),
            impact=impact_summary,
            affected_segments=affected_segment_ids if affected_segment_ids else None,
            status="ACTIVE",
        )
        self.db.add(disruption)
        self.db.commit()
        self.db.refresh(disruption)

        # Step 5: Update itinerary status
        itinerary = self.db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
        if itinerary:
            itinerary.status = "DISRUPTED"
            self.db.commit()

        # Step 6: Audit
        self.audit_svc.log(
            itinerary_id=itinerary_id,
            event="DISRUPTION_DETECTED",
            actor="SYSTEM",
            action=f"{disruption_type} detected on {flight.flight_number} ({flight.origin}->{flight.destination})",
            result="SUCCESS",
            details={
                "disruption_id": disruption.id,
                "flight_id": flight.id,
                "type": disruption_type,
                "severity": severity,
                "affected_downstream": affected_segment_ids,
            },
        )

        logger.info(
            "DISRUPTION  %s created  type=%s  severity=%s  flight=%s  downstream=%d affected",
            disruption.id, disruption_type, severity, flight.flight_number, len(affected_segment_ids),
        )
        return disruption

    # ── Cascade Analysis ────────────────────────────────────────────────────
    def _analyze_cascade(
        self,
        itinerary_id: str,
        disrupted_segment: TravelSegment,
        disrupted_flight: Flight,
        disruption_type: str,
        delay_minutes: int,
    ) -> tuple[str, list[str]]:
        """
        Walk the itinerary graph to find downstream segments affected
        by this disruption.

        Returns (impact_summary, affected_segment_ids).
        """
        # Get all segments after the disrupted one, in order
        downstream_segments = (
            self.db.query(TravelSegment)
            .filter(
                TravelSegment.itinerary_id == itinerary_id,
                TravelSegment.sequence_order > disrupted_segment.sequence_order,
            )
            .order_by(TravelSegment.sequence_order)
            .all()
        )

        affected_ids = []
        impact_parts = []

        if disruption_type == "CANCELLATION":
            # ALL downstream connections are broken
            for seg in downstream_segments:
                affected_ids.append(seg.id)
                if seg.flight:
                    impact_parts.append(
                        f"Connection {seg.flight.flight_number} ({seg.flight.origin}->{seg.flight.destination}) is broken"
                    )

            # Check hotel impact
            hotels = self.db.query(HotelBooking).filter(HotelBooking.itinerary_id == itinerary_id).all()
            for hotel in hotels:
                impact_parts.append(
                    f"Hotel {hotel.hotel_name} check-in on {hotel.check_in.strftime('%d %b')} may need adjustment"
                )

        elif disruption_type == "DELAY" and delay_minutes > 0:
            # Check if delay breaks connection windows
            new_arrival = disrupted_flight.scheduled_arrival + timedelta(minutes=delay_minutes)

            for seg in downstream_segments:
                if seg.flight and seg.flight.scheduled_departure:
                    gap_minutes = minutes_between(new_arrival, seg.flight.scheduled_departure)
                    if gap_minutes < 90:  # Min connection time
                        affected_ids.append(seg.id)
                        impact_parts.append(
                            f"Connection {seg.flight.flight_number} has only {gap_minutes}min buffer (minimum 90min required)"
                        )

        if not impact_parts:
            return "No downstream segments affected.", affected_ids

        return " | ".join(impact_parts), affected_ids

    def _build_description(self, flight: Flight, disruption_type: str, delay_minutes: int) -> str:
        base = f"Flight {flight.flight_number} ({flight.origin} -> {flight.destination})"
        if disruption_type == "CANCELLATION":
            return f"{base} has been CANCELLED."
        elif disruption_type == "DELAY":
            return f"{base} is delayed by {delay_minutes} minutes."
        elif disruption_type == "MISSED_CONNECTION":
            return f"{base} delay of {delay_minutes} minutes causes a missed connection downstream."
        return f"{base} has an unspecified disruption."
