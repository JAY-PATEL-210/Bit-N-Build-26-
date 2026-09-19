from sqlalchemy import Column, String, DateTime, Float
from app.core.database import Base

class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(String, primary_key=True)
    itinerary_id = Column(String, nullable=False)
    hotel_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    booking_reference = Column(String)
    price = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="CONFIRMED")
