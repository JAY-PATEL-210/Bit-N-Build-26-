# Owner: Member C
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.repositories.base import BaseRepository
from app.models.itinerary import Itinerary, TravelSegment


class ItineraryRepository(BaseRepository[Itinerary]):
    def __init__(self, db: Session):
        super().__init__(Itinerary, db)

    def get_with_details(self, itinerary_id: str) -> Optional[Itinerary]:
        return (
            self.db.query(Itinerary)
            .options(
                joinedload(Itinerary.segments).joinedload(TravelSegment.flight),
                joinedload(Itinerary.hotel_bookings),
                joinedload(Itinerary.disruptions),
            )
            .filter(Itinerary.id == itinerary_id)
            .first()
        )

    def get_active(self) -> List[Itinerary]:
        return self.db.query(Itinerary).filter(Itinerary.status == "ACTIVE").all()

    def get_by_user(self, user_id: str) -> List[Itinerary]:
        return self.db.query(Itinerary).filter(Itinerary.user_id == user_id).all()
