from sqlalchemy import Column, String, Float, DateTime, JSON, Text
from datetime import datetime
from app.core.database import Base

class AgentDecision(Base):
    __tablename__ = "agent_decisions"
    id = Column(String, primary_key=True)
    decision_id = Column(String, unique=True, nullable=False)
    itinerary_id = Column(String, nullable=False)
    disruption_id = Column(String, nullable=False)
    ai_model = Column(String, nullable=False)
    decision = Column(String, nullable=False)
    selected_option = Column(String)
    confidence = Column(Float, nullable=False)
    reason_codes = Column(JSON)
    explanation = Column(Text)
    validation_result = Column(String)
    execution_result = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
