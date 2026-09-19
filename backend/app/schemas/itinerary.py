from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.flight import FlightResponse

class ItineraryBase(BaseModel):
    trip_name: str
    start_date: datetime
    end_date: datetime

class ItineraryCreate(ItineraryBase):
    user_id: str

class ItineraryResponse(ItineraryBase):
    id: str
    user_id: str
    status: str
    flights: List[FlightResponse] = []

    class Config:
        from_attributes = True
