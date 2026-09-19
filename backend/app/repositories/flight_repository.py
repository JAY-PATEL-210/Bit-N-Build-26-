# Owner: Member C
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.itinerary import Flight


class FlightRepository(BaseRepository[Flight]):
    def __init__(self, db: Session):
        super().__init__(Flight, db)

    def get_by_segment(self, segment_id: str) -> Optional[Flight]:
        return self.db.query(Flight).filter(Flight.segment_id == segment_id).first()

    def get_by_flight_number(self, flight_number: str) -> Optional[Flight]:
        return self.db.query(Flight).filter(Flight.flight_number == flight_number).first()

    def get_by_status(self, status: str) -> List[Flight]:
        return self.db.query(Flight).filter(Flight.status == status).all()
