from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    itinerary_id = Column(String, nullable=False)
    event = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    decision_id = Column(String)
    action = Column(String, nullable=False)
    result = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    audit_metadata = Column(JSON)
