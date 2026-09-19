# Owner: Member C
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.repositories.base import BaseRepository
from app.models.itinerary import Disruption, AlternativeFlight


class DisruptionRepository(BaseRepository[Disruption]):
    def __init__(self, db: Session):
        super().__init__(Disruption, db)

    def get_active(self) -> List[Disruption]:
        return self.db.query(Disruption).filter(Disruption.status.in_(["ACTIVE", "ANALYZING"])).all()

    def get_by_itinerary(self, itinerary_id: str) -> List[Disruption]:
        return self.db.query(Disruption).filter(Disruption.itinerary_id == itinerary_id).all()

    def get_with_alternatives(self, disruption_id: str) -> Optional[Disruption]:
        return (
            self.db.query(Disruption)
            .options(joinedload(Disruption.alternatives))
            .filter(Disruption.id == disruption_id)
            .first()
        )

    def get_alternatives(self, disruption_id: str) -> List[AlternativeFlight]:
        return (
            self.db.query(AlternativeFlight)
            .filter(AlternativeFlight.disruption_id == disruption_id)
            .order_by(AlternativeFlight.score.desc())
            .all()
        )
