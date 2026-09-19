from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import FlightStatus

class FlightBase(BaseModel):
    airline: str
    flight_number: str
    origin: str
    destination: str
    scheduled_departure: datetime
    scheduled_arrival: datetime

class FlightResponse(FlightBase):
    id: str
    status: FlightStatus
    terminal: Optional[str] = None
    gate: Optional[str] = None

    class Config:
        from_attributes = True
