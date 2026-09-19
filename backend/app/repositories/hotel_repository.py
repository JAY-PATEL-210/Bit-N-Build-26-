from sqlalchemy.orm import Session
from app.models.hotel import Hotel

class HotelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_itinerary(self, itinerary_id: str):
        return self.db.query(Hotel).filter(Hotel.itinerary_id == itinerary_id).all()
