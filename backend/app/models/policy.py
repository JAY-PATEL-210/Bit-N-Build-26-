from sqlalchemy import Column, String, Float, Integer, Boolean
from app.core.database import Base

class Policy(Base):
    __tablename__ = "policies"
    id = Column(String, primary_key=True)
    user_id = Column(String)
    max_additional_fare = Column(Float, default=20000.0)
    currency = Column(String, default="INR")
    max_stops = Column(Integer, default=1)
    min_connection_minutes = Column(Integer, default=90)
    autonomous_rebooking = Column(Boolean, default=True)
    autonomous_hotel_modification = Column(Boolean, default=True)
