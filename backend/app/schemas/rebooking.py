from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import RebookingStatus

class RebookingCreate(BaseModel):
    disruption_id: str
    alternative_id: str
    idempotency_key: str

class RebookingResponse(BaseModel):
    id: str
    disruption_id: str
    idempotency_key: str
    status: RebookingStatus
    created_at: datetime
    confirmed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
