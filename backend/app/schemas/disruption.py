# Owner: Member C
from pydantic import BaseModel, Field
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
    event_type: str = Field(alias="eventType")
    flight_id: str = Field(alias="flightId")
    itinerary_id: str = Field(alias="itineraryId")
    delay_minutes: Optional[int] = Field(None, alias="delayMinutes")

    model_config = {"populate_by_name": True}

