# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Itinerary Service  --  Trip management with full segment graph (FR-02)
# ──────────────────────────────────────────────────────────────────────────────
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.itinerary import Itinerary, TravelSegment, Flight, HotelBooking
from app.repositories.itinerary_repository import ItineraryRepository
from app.core.logging import logger


class ItineraryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ItineraryRepository(db)

    def get_all(self) -> List[Itinerary]:
        return self.repo.get_all()

    def get_by_id(self, itinerary_id: str) -> Optional[Itinerary]:
        return self.repo.get_by_id(itinerary_id)

    def get_detail(self, itinerary_id: str) -> Optional[dict]:
        """Get full itinerary with nested flights and hotels as a dict."""
        itin = self.repo.get_with_details(itinerary_id)
        if not itin:
            return None

        flights = []
        for seg in itin.segments:
            if seg.flight:
                f = seg.flight
                flights.append({
                    "id": f.id,
                    "segment_id": seg.id,
                    "sequence_order": seg.sequence_order,
                    "airline": f.airline,
                    "flight_number": f.flight_number,
                    "origin": f.origin,
                    "destination": f.destination,
                    "scheduled_departure": f.scheduled_departure.isoformat() if f.scheduled_departure else None,
                    "scheduled_arrival": f.scheduled_arrival.isoformat() if f.scheduled_arrival else None,
                    "estimated_departure": f.estimated_departure.isoformat() if f.estimated_departure else None,
                    "estimated_arrival": f.estimated_arrival.isoformat() if f.estimated_arrival else None,
                    "status": f.status,
                    "terminal": f.terminal,
                    "gate": f.gate,
                })

        hotels = []
        for h in itin.hotel_bookings:
            hotels.append({
                "id": h.id,
                "hotel_name": h.hotel_name,
                "location": h.location,
                "check_in": h.check_in.isoformat() if h.check_in else None,
                "check_out": h.check_out.isoformat() if h.check_out else None,
                "booking_reference": h.booking_reference,
                "status": h.status,
            })

        return {
            "id": itin.id,
            "user_id": itin.user_id,
            "trip_name": itin.trip_name,
            "start_date": itin.start_date.isoformat() if itin.start_date else None,
            "end_date": itin.end_date.isoformat() if itin.end_date else None,
            "status": itin.status,
            "flights": flights,
            "hotels": hotels,
        }

    def update_status(self, itinerary_id: str, new_status: str) -> Optional[Itinerary]:
        itin = self.repo.get_by_id(itinerary_id)
        if itin:
            itin.status = new_status
            self.db.commit()
            self.db.refresh(itin)
            logger.info("ITINERARY  %s status -> %s", itinerary_id, new_status)
        return itin

    def get_flights_for_itinerary(self, itinerary_id: str) -> List[Flight]:
        """Get all flights in segment order."""
        segments = (
            self.db.query(TravelSegment)
            .filter(TravelSegment.itinerary_id == itinerary_id)
            .order_by(TravelSegment.sequence_order)
            .all()
        )
        return [seg.flight for seg in segments if seg.flight]
