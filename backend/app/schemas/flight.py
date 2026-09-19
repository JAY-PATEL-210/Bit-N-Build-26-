# Owner: Member C
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import FlightStatus


class FlightResponse(BaseModel):
    id: str
    segment_id: str
    airline: str
    flight_number: str
    origin: str
    destination: str
    scheduled_departure: datetime
    scheduled_arrival: datetime
    estimated_departure: Optional[datetime] = None
    estimated_arrival: Optional[datetime] = None
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    status: str
    terminal: Optional[str] = None
    gate: Optional[str] = None

    model_config = {"from_attributes": True}
