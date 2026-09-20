# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Canonical Database Models  --  Single source of truth for the entire ORM.
# All per-entity model files (user.py, flight.py ...) re-export from here.
# ──────────────────────────────────────────────────────────────────────────────
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


# ── User & Preferences ─────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    password_hash = Column(String)
    role = Column(String, default="TRAVELER")
    company_name = Column(String)
    airline_code = Column(String)

    preferences = relationship("TravelPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    itineraries = relationship("Itinerary", back_populates="user", cascade="all, delete-orphan")


class TravelPreferences(Base):
    __tablename__ = "travel_preferences"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    autonomous_rebooking = Column(Boolean, default=True)
    autonomous_hotel_modification = Column(Boolean, default=True)
    preferred_cabin = Column(String, default="ECONOMY")
    max_additional_fare = Column(Float, default=20000.0)
    currency = Column(String, default="INR")
    min_connection_minutes = Column(Integer, default=90)

    user = relationship("User", back_populates="preferences")


# ── Itinerary ───────────────────────────────────────────────────────────────
class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    trip_name = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, DISRUPTED, RESOLVED, COMPLETED

    user = relationship("User", back_populates="itineraries")
    segments = relationship("TravelSegment", back_populates="itinerary", order_by="TravelSegment.sequence_order", cascade="all, delete-orphan")
    hotel_bookings = relationship("HotelBooking", back_populates="itinerary", cascade="all, delete-orphan")
    disruptions = relationship("Disruption", back_populates="itinerary", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="itinerary", cascade="all, delete-orphan")


# ── Travel Segment ──────────────────────────────────────────────────────────
class TravelSegment(Base):
    __tablename__ = "travel_segments"

    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"), nullable=False)
    segment_type = Column(String, default="FLIGHT")  # FLIGHT, TRAIN, BUS
    sequence_order = Column(Integer, default=1)
    booking_reference = Column(String)

    itinerary = relationship("Itinerary", back_populates="segments")
    flight = relationship("Flight", back_populates="segment", uselist=False, cascade="all, delete-orphan")


# ── Flight ──────────────────────────────────────────────────────────────────
class Flight(Base):
    __tablename__ = "flights"

    id = Column(String, primary_key=True)
    segment_id = Column(String, ForeignKey("travel_segments.id"), nullable=False)
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String(3), nullable=False)      # IATA code
    destination = Column(String(3), nullable=False)  # IATA code
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


# ── Hotel Booking ───────────────────────────────────────────────────────────
class HotelBooking(Base):
    __tablename__ = "hotel_bookings"

    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"), nullable=False)
    hotel_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    booking_reference = Column(String)
    price = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="CONFIRMED")  # CONFIRMED, MODIFIED, CANCELLED

    itinerary = relationship("Itinerary", back_populates="hotel_bookings")


# ── Disruption ──────────────────────────────────────────────────────────────
class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"), nullable=False)
    segment_id = Column(String, ForeignKey("travel_segments.id"), nullable=False)
    type = Column(String, nullable=False)        # Maps to DisruptionType enum
    severity = Column(String, nullable=False)    # Maps to DisruptionSeverity enum
    detected_at = Column(DateTime, default=_utcnow)
    source = Column(String, default="MONITOR")   # MONITOR, SIMULATION, MANUAL
    description = Column(Text)
    impact = Column(Text)                        # Human-readable impact summary
    affected_segments = Column(JSON)             # List of downstream segment IDs affected
    status = Column(String, default="ACTIVE")    # ACTIVE, ANALYZING, RESOLVED, EXPIRED

    itinerary = relationship("Itinerary", back_populates="disruptions")
    alternatives = relationship("AlternativeFlight", back_populates="disruption", cascade="all, delete-orphan")
    rebooking_requests = relationship("RebookingRequest", back_populates="disruption", cascade="all, delete-orphan")


# ── Alternative Flight ──────────────────────────────────────────────────────
class AlternativeFlight(Base):
    __tablename__ = "alternative_flights"

    id = Column(String, primary_key=True)
    disruption_id = Column(String, ForeignKey("disruptions.id"), nullable=False)
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer)
    stops = Column(Integer, default=0)
    additional_fare = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    policy_compliant = Column(Boolean, default=True)
    policy_violations = Column(JSON)             # List of violation reason strings
    score = Column(Float, default=0.0)           # Deterministic ranking score (0-100)
    explanation = Column(Text)                   # Scoring rationale
    recommended = Column(Boolean, default=False)

    disruption = relationship("Disruption", back_populates="alternatives")


# ── Rebooking Request ───────────────────────────────────────────────────────
class RebookingRequest(Base):
    __tablename__ = "rebooking_requests"

    id = Column(String, primary_key=True)
    disruption_id = Column(String, ForeignKey("disruptions.id"), nullable=False)
    alternative_id = Column(String, ForeignKey("alternative_flights.id"))
    idempotency_key = Column(String, unique=True, nullable=False)
    status = Column(String, default="PENDING")   # Maps to RebookingStatus enum
    booking_reference = Column(String)            # Confirmation code from provider
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)
    confirmed_at = Column(DateTime)
    failure_reason = Column(Text)

    disruption = relationship("Disruption", back_populates="rebooking_requests")
    alternative = relationship("AlternativeFlight")


# ── Notification ────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    itinerary_id = Column(String, ForeignKey("itineraries.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="INFO")        # INFO, WARNING, ACTION_REQUIRED, SUCCESS
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    itinerary = relationship("Itinerary", back_populates="notifications")


# ── Audit Log ───────────────────────────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True)
    itinerary_id = Column(String, nullable=False)
    event = Column(String, nullable=False)       # e.g. DISRUPTION_DETECTED, REBOOKING_CONFIRMED
    actor = Column(String, nullable=False)        # USER, AI_AGENT, SYSTEM, EXTERNAL_API
    decision_id = Column(String)
    action = Column(String, nullable=False)       # What happened
    result = Column(String, nullable=False)       # SUCCESS, FAILURE, PENDING
    details = Column(JSON)                        # Additional structured context
    timestamp = Column(DateTime, default=_utcnow)


# ── Agent Decision ──────────────────────────────────────────────────────────
class AgentDecision(Base):
    __tablename__ = "agent_decisions"

    id = Column(String, primary_key=True)
    decision_id = Column(String, unique=True, nullable=False)
    itinerary_id = Column(String, nullable=False)
    disruption_id = Column(String, nullable=False)
    ai_model = Column(String, nullable=False)
    decision = Column(String, nullable=False)     # REBOOK, ESCALATE, CANCEL, WAIT
    selected_option = Column(String)              # Alternative flight ID
    confidence = Column(Float, nullable=False)
    reason_codes = Column(JSON)
    explanation = Column(Text)
    validation_result = Column(String)            # PASSED, FAILED, OVERRIDE
    execution_result = Column(String)             # CONFIRMED, FAILED, PENDING
    timestamp = Column(DateTime, default=_utcnow)
