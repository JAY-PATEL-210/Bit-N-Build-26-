from pydantic import BaseModel
from datetime import datetime

class AlternativeResponse(BaseModel):
    id: str
    disruption_id: str
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    additional_fare: float
    policy_compliant: bool
    score: float

    class Config:
        from_attributes = True
