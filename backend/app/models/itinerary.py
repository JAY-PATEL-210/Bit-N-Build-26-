# Owner: Member C (Backend Lead / Core Services)
# Sections 20, 21, 22: Canonical Database Models
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    
    preferences = relationship("TravelPreferences", back_populates="user", uselist=False)
    itineraries = relationship("Itinerary", back_populates="user")

class TravelPreferences(Base):
    __tablename__ = "travel_preferences"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    autonomous_rebooking = Column(Boolean, default=True)
    autonomous_hotel_modification = Column(Boolean, default=True)
    preferred_cabin = Column(String, default="ECONOMY")
    max_additional_fare = Column(Float, default=20000.0)
    currency = Column(String, default="INR")
    min_connection_minutes = Column(Integer, default=90)
    
    user = relationship("User", back_populates="preferences")

class Itinerary(Base):
    __tablename__ = "itineraries"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    trip_name = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="ACTIVE")
    
    user = relationship("User", back_populates="itineraries")
    segments = relationship("TravelSegment", back_populates="itinerary")
    hotel_bookings = relationship("HotelBooking", back_populates="itinerary")
    disruptions = relationship("Disruption", back_populates="itinerary")

class TravelSegment(Base):
    __tablename__ = "travel_segments"
    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"))
    segment_type = Column(String, default="FLIGHT")
    sequence_order = Column(Integer, default=1)
    booking_reference = Column(String)
    
    itinerary = relationship("Itinerary", back_populates="segments")
    flight = relationship("Flight", back_populates="segment", uselist=False)

class Flight(Base):
    __tablename__ = "flights"
    id = Column(String, primary_key=True)
    segment_id = Column(String, ForeignKey("travel_segments.id"))
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
    
    segment = relationship("TravelSegment", back_populates="flight")

class HotelBooking(Base):
    __tablename__ = "hotel_bookings"
    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"))
    hotel_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    booking_reference = Column(String)
    price = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="CONFIRMED")
    
    itinerary = relationship("Itinerary", back_populates="hotel_bookings")

class Disruption(Base):
    __tablename__ = "disruptions"
    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"))
    segment_id = Column(String, ForeignKey("travel_segments.id"))
    type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="MONITOR")
    description = Column(Text)
    impact = Column(Text)
    status = Column(String, default="ACTIVE")
    
    itinerary = relationship("Itinerary", back_populates="disruptions")
    alternatives = relationship("AlternativeFlight", back_populates="disruption")
    rebooking_requests = relationship("RebookingRequest", back_populates="disruption")

class AlternativeFlight(Base):
    __tablename__ = "alternative_flights"
    id = Column(String, primary_key=True)
    disruption_id = Column(String, ForeignKey("disruptions.id"))
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    additional_fare = Column(Float, nullable=False)
    policy_compliant = Column(Boolean, default=True)
    score = Column(Float, default=0.0)
    
    disruption = relationship("Disruption", back_populates="alternatives")

class RebookingRequest(Base):
    __tablename__ = "rebooking_requests"
    id = Column(String, primary_key=True)
    disruption_id = Column(String, ForeignKey("disruptions.id"))
    idempotency_key = Column(String, unique=True, nullable=False)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime)
    
    disruption = relationship("Disruption", back_populates="rebooking_requests")

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
