from sqlalchemy.orm import Session
from app.models.itinerary import Itinerary

class ItineraryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, itinerary_id: str):
        return self.db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()

    def get_all(self):
        return self.db.query(Itinerary).all()
