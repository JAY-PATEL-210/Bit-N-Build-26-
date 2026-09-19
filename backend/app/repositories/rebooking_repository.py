# Owner: Member C
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.itinerary import RebookingRequest


class RebookingRepository(BaseRepository[RebookingRequest]):
    def __init__(self, db: Session):
        super().__init__(RebookingRequest, db)

    def get_by_idempotency_key(self, key: str) -> Optional[RebookingRequest]:
        return self.db.query(RebookingRequest).filter(RebookingRequest.idempotency_key == key).first()

    def get_by_disruption(self, disruption_id: str):
        return self.db.query(RebookingRequest).filter(RebookingRequest.disruption_id == disruption_id).all()
