# Owner: Member C
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import HotelAction


class HotelModifyRequest(BaseModel):
    check_in: datetime
    check_out: Optional[datetime] = None
    action: HotelAction = HotelAction.MODIFY_CHECKIN
    reason: Optional[str] = None


class HotelResponse(BaseModel):
    id: str
    itinerary_id: str
    hotel_name: str
    location: str
    check_in: datetime
    check_out: datetime
    booking_reference: Optional[str] = None
    price: Optional[float] = None
    currency: str = "INR"
    status: str

    model_config = {"from_attributes": True}
