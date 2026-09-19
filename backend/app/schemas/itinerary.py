# Owner: Member C
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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


class SegmentResponse(BaseModel):
    id: str
    segment_type: str
    sequence_order: int
    booking_reference: Optional[str] = None

    model_config = {"from_attributes": True}


class ItineraryCreate(BaseModel):
    user_id: str
    trip_name: str
    start_date: datetime
    end_date: datetime


class ItineraryResponse(BaseModel):
    id: str
    user_id: str
    trip_name: str
    start_date: datetime
    end_date: datetime
    status: str

    model_config = {"from_attributes": True}


class ItineraryDetailResponse(BaseModel):
    """Full itinerary with nested flights and hotels."""
    id: str
    user_id: str
    trip_name: str
    start_date: datetime
    end_date: datetime
    status: str
    flights: List[dict] = []
    hotels: List[dict] = []

    model_config = {"from_attributes": True}
