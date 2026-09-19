# Owner: Member C
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DisruptionResponse(BaseModel):
    id: str
    itinerary_id: str
    segment_id: str
    type: str
    severity: str
    detected_at: datetime
    source: str
    description: Optional[str] = None
    impact: Optional[str] = None
    affected_segments: Optional[List[str]] = None
    status: str

    model_config = {"from_attributes": True}


class SimulateDisruptionRequest(BaseModel):
    event_type: str          # e.g. "CANCELLATION", "DELAY"
    flight_id: str
    itinerary_id: str
    delay_minutes: Optional[int] = None
