# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Flight Monitor Service  --  Status tracking & disruption detection (FR-03, FR-04)
# ──────────────────────────────────────────────────────────────────────────────
from typing import Optional
from sqlalchemy.orm import Session
from app.models.itinerary import Flight
from app.repositories.flight_repository import FlightRepository
from app.core.logging import logger


class FlightMonitorService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FlightRepository(db)

    def get_flight(self, flight_id: str) -> Optional[Flight]:
        return self.repo.get_by_id(flight_id)

    def get_status(self, flight_id: str) -> Optional[dict]:
        flight = self.repo.get_by_id(flight_id)
        if not flight:
            return None
        return {
            "flight_id": flight.id,
            "flight_number": flight.flight_number,
            "status": flight.status,
            "origin": flight.origin,
            "destination": flight.destination,
            "scheduled_departure": flight.scheduled_departure.isoformat() if flight.scheduled_departure else None,
            "scheduled_arrival": flight.scheduled_arrival.isoformat() if flight.scheduled_arrival else None,
            "estimated_departure": flight.estimated_departure.isoformat() if flight.estimated_departure else None,
            "estimated_arrival": flight.estimated_arrival.isoformat() if flight.estimated_arrival else None,
        }

    def update_status(self, flight_id: str, new_status: str) -> Optional[Flight]:
        flight = self.repo.get_by_id(flight_id)
        if flight:
            old_status = flight.status
            flight.status = new_status
            self.db.commit()
            self.db.refresh(flight)
            logger.info(
                "FLIGHT  %s (%s->%s)  status: %s -> %s",
                flight.flight_number, flight.origin, flight.destination,
                old_status, new_status,
            )
        return flight
