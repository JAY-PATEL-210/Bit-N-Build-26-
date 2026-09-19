# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Hotel Service  --  Automatic hotel modification after rebooking (FR-11)
# ──────────────────────────────────────────────────────────────────────────────
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.itinerary import HotelBooking
from app.repositories.hotel_repository import HotelRepository
from app.core.logging import logger


class HotelService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = HotelRepository(db)

    def get_by_itinerary(self, itinerary_id: str) -> list[HotelBooking]:
        return self.repo.get_by_itinerary(itinerary_id)

    def recalculate_checkin(
        self,
        itinerary_id: str,
        new_arrival_time: datetime,
    ) -> list[dict]:
        """
        After rebooking, recalculate hotel check-in dates based on new
        flight arrival time.  Returns list of modification actions taken.
        """
        hotels = self.repo.get_by_itinerary(itinerary_id)
        modifications = []

        for hotel in hotels:
            original_checkin = hotel.check_in
            # New check-in = day of arrival (if arrival is after original check-in)
            new_checkin_date = new_arrival_time.replace(hour=14, minute=0, second=0, microsecond=0)

            if new_arrival_time.hour >= 22:
                # Late-night arrival -> check in next day
                new_checkin_date = new_checkin_date + timedelta(days=1)

            if new_checkin_date != original_checkin:
                hotel.check_in = new_checkin_date
                hotel.status = "MODIFIED"
                self.db.commit()
                self.db.refresh(hotel)

                action = {
                    "hotel_id": hotel.id,
                    "hotel_name": hotel.hotel_name,
                    "action": "MODIFY_CHECKIN",
                    "original_checkin": original_checkin.isoformat(),
                    "new_checkin": new_checkin_date.isoformat(),
                    "reason": f"Flight arrival changed to {new_arrival_time.strftime('%d %b %Y, %H:%M')}",
                }
                modifications.append(action)
                logger.info(
                    "HOTEL  Modified check-in for %s: %s -> %s",
                    hotel.hotel_name,
                    original_checkin.strftime("%d %b"),
                    new_checkin_date.strftime("%d %b"),
                )
            else:
                modifications.append({
                    "hotel_id": hotel.id,
                    "hotel_name": hotel.hotel_name,
                    "action": "NO_ACTION",
                    "reason": "Check-in date unchanged",
                })

        return modifications

    def modify_hotel(self, hotel_id: str, check_in: datetime = None, check_out: datetime = None) -> HotelBooking:
        hotel = self.repo.get_by_id(hotel_id)
        if not hotel:
            return None
        if check_in:
            hotel.check_in = check_in
        if check_out:
            hotel.check_out = check_out
        hotel.status = "MODIFIED"
        self.db.commit()
        self.db.refresh(hotel)
        return hotel
