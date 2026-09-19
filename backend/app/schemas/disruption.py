from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import DisruptionType, DisruptionSeverity

class DisruptionBase(BaseModel):
    itinerary_id: str
    segment_id: str
    type: DisruptionType
    severity: DisruptionSeverity
    description: str

class DisruptionResponse(DisruptionBase):
    id: str
    detected_at: datetime
    status: str
    impact: Optional[str] = None

    class Config:
        from_attributes = True
