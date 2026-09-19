from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Disruption(Base):
    __tablename__ = "disruptions"
    id = Column(String, primary_key=True)
    itinerary_id = Column(String, nullable=False)
    segment_id = Column(String, nullable=False)
    type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="MONITOR")
    description = Column(Text)
    impact = Column(Text)
    status = Column(String, default="ACTIVE")
