# Owner: Member C
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    itinerary_id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
