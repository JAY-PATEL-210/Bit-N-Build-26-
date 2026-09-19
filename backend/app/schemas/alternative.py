# Owner: Member C
from pydantic import BaseModel
from typing import Optional, List
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
    duration_minutes: Optional[int] = None
    stops: int = 0
    additional_fare: float
    currency: str = "INR"
    policy_compliant: bool
    policy_violations: Optional[List[str]] = None
    score: float
    explanation: Optional[str] = None
    recommended: bool = False

    model_config = {"from_attributes": True}
