from sqlalchemy import Column, String, DateTime, Float, Boolean
from app.core.database import Base

class Alternative(Base):
    __tablename__ = "alternatives"
    id = Column(String, primary_key=True)
    disruption_id = Column(String, nullable=False)
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    additional_fare = Column(Float, nullable=False)
    policy_compliant = Column(Boolean, default=True)
    score = Column(Float, default=0.0)
