from sqlalchemy.orm import Session
from app.models.disruption import Disruption

class DisruptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, disruption_id: str):
        return self.db.query(Disruption).filter(Disruption.id == disruption_id).first()

    def get_active(self):
        return self.db.query(Disruption).filter(Disruption.status == "ACTIVE").all()
