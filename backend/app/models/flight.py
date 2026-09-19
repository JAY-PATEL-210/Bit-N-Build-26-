from sqlalchemy import Column, String, DateTime
from app.core.database import Base

class Flight(Base):
    __tablename__ = "flights"
    id = Column(String, primary_key=True)
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    scheduled_departure = Column(DateTime, nullable=False)
    scheduled_arrival = Column(DateTime, nullable=False)
    estimated_departure = Column(DateTime)
    estimated_arrival = Column(DateTime)
    actual_departure = Column(DateTime)
    actual_arrival = Column(DateTime)
    status = Column(String, default="SCHEDULED")
    terminal = Column(String)
    gate = Column(String)
