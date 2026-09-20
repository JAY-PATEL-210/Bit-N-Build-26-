# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Itinerary Service  --  Trip management with full segment graph (FR-02)
# ──────────────────────────────────────────────────────────────────────────────
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.itinerary import Itinerary, TravelSegment, Flight, HotelBooking
from app.repositories.itinerary_repository import ItineraryRepository
from app.schemas.common import ItineraryStatus
from app.utils.idempotency import generate_id
from app.core.logging import logger


class ItineraryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ItineraryRepository(db)

    def get_all(self) -> List[Itinerary]:
        return self.repo.get_all()

    def get_by_user(self, user_id: str) -> List[Itinerary]:
        return self.repo.get_by_user(user_id)

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
            "hotel": hotels[0] if hotels else None,
        }

    def create_itinerary(
        self,
        user_id: str,
        trip_name: str,
        start_date,
        end_date,
        flights: list = None,
        hotels: list = None,
    ) -> Itinerary:
        """
        Create a full itinerary with nested flight segments and hotel bookings.

        Args:
            user_id: Owner user ID
            trip_name: Human-readable trip name
            start_date: Trip start datetime
            end_date: Trip end datetime
            flights: List of FlightInput-like dicts (airline, flight_number, origin, dest, etc.)
            hotels: List of HotelInput-like dicts (hotel_name, location, check_in, check_out, etc.)

        Returns:
            Created Itinerary ORM object
        """
        itinerary_id = generate_id("TRIP-")

        itinerary = Itinerary(
            id=itinerary_id,
            user_id=user_id,
            trip_name=trip_name,
            start_date=start_date,
            end_date=end_date,
            status="ACTIVE",
        )
        self.db.add(itinerary)

        # Create flight segments
        for idx, flt in enumerate(flights or [], start=1):
            seg_id = generate_id("SEG-")
            segment = TravelSegment(
                id=seg_id,
                itinerary_id=itinerary_id,
                segment_type="FLIGHT",
                sequence_order=idx,
                booking_reference=flt.get("booking_reference"),
            )
            self.db.add(segment)

            flight = Flight(
                id=generate_id("FLT-"),
                segment_id=seg_id,
                airline=flt.get("airline", "Unknown"),
                flight_number=flt.get("flight_number", ""),
                origin=flt.get("origin", ""),
                destination=flt.get("destination", ""),
                scheduled_departure=flt.get("scheduled_departure"),
                scheduled_arrival=flt.get("scheduled_arrival"),
                status="SCHEDULED",
                terminal=flt.get("terminal"),
                gate=flt.get("gate"),
            )
            self.db.add(flight)

        # Create hotel bookings
        for htl in hotels or []:
            hotel = HotelBooking(
                id=generate_id("HTL-"),
                itinerary_id=itinerary_id,
                hotel_name=htl.get("hotel_name", ""),
                location=htl.get("location", ""),
                check_in=htl.get("check_in"),
                check_out=htl.get("check_out"),
                booking_reference=htl.get("booking_reference"),
                price=htl.get("price"),
                currency=htl.get("currency", "INR"),
                status="CONFIRMED",
            )
            self.db.add(hotel)

        self.db.commit()
        self.db.refresh(itinerary)

        logger.info(
            "ITINERARY  Created %s (%s) with %d flights, %d hotels",
            itinerary_id, trip_name, len(flights or []), len(hotels or []),
        )
        return itinerary

    def update_status(self, itinerary_id: str, new_status: str) -> Optional[Itinerary]:
        """Update itinerary status with enum validation."""
        # Validate status enum
        valid_statuses = {s.value for s in ItineraryStatus}
        if new_status not in valid_statuses:
            raise ValueError(
                f"Invalid status '{new_status}'. Valid values: {', '.join(sorted(valid_statuses))}"
            )

        itin = self.repo.get_by_id(itinerary_id)
        if itin:
            itin.status = new_status
            self.db.commit()
            self.db.refresh(itin)
            logger.info("ITINERARY  %s status -> %s", itinerary_id, new_status)
        return itin

    def update_itinerary(self, itinerary_id: str, updates: dict) -> Optional[Itinerary]:
        """Update itinerary fields (trip_name, status)."""
        itin = self.repo.get_by_id(itinerary_id)
        if not itin:
            return None

        if "status" in updates and updates["status"]:
            valid_statuses = {s.value for s in ItineraryStatus}
            if updates["status"] not in valid_statuses:
                raise ValueError(
                    f"Invalid status '{updates['status']}'. Valid values: {', '.join(sorted(valid_statuses))}"
                )
            itin.status = updates["status"]

        if "trip_name" in updates and updates["trip_name"]:
            itin.trip_name = updates["trip_name"]

        self.db.commit()
        self.db.refresh(itin)
        logger.info("ITINERARY  %s updated", itinerary_id)
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
