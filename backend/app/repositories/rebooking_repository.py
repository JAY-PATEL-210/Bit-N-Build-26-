from sqlalchemy.orm import Session
from app.models.rebooking import Rebooking

class RebookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_idempotency_key(self, key: str):
        return self.db.query(Rebooking).filter(Rebooking.idempotency_key == key).first()

    def create(self, rebooking: Rebooking):
        self.db.add(rebooking)
        self.db.commit()
        self.db.refresh(rebooking)
        return rebooking
