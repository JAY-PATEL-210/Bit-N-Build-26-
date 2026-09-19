# Owner: Member C
from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.itinerary import HotelBooking


class HotelRepository(BaseRepository[HotelBooking]):
    def __init__(self, db: Session):
        super().__init__(HotelBooking, db)

    def get_by_itinerary(self, itinerary_id: str) -> List[HotelBooking]:
        return self.db.query(HotelBooking).filter(HotelBooking.itinerary_id == itinerary_id).all()
