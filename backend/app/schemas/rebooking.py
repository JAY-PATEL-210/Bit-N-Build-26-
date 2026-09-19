# Owner: Member C
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RebookingCreate(BaseModel):
    disruption_id: str = Field(alias="disruptionId")
    alternative_id: str = Field(alias="alternativeId")
    idempotency_key: str = Field(alias="idempotencyKey")

    model_config = {"populate_by_name": True}


class RebookingPreviewRequest(BaseModel):
    disruption_id: str = Field(alias="disruptionId")
    alternative_id: str = Field(alias="alternativeId")

    model_config = {"populate_by_name": True}


class RebookingResponse(BaseModel):
    id: str
    disruption_id: str
    alternative_id: Optional[str] = None
    idempotency_key: str
    status: str
    booking_reference: Optional[str] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None

    model_config = {"from_attributes": True}

