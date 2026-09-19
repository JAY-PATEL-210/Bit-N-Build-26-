from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True
