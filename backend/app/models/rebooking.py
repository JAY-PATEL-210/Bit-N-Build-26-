from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.core.database import Base

class Rebooking(Base):
    __tablename__ = "rebookings"
    id = Column(String, primary_key=True)
    disruption_id = Column(String, nullable=False)
    idempotency_key = Column(String, unique=True, nullable=False)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime)
