from sqlalchemy.orm import Session
from app.models.flight import Flight

class FlightRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, flight_id: str):
        return self.db.query(Flight).filter(Flight.id == flight_id).first()
