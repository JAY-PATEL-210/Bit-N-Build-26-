# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Demo Data Seeder  --  Pre-populates the SRS core scenario
#
# Route:  Mumbai (BOM) -> Delhi (DEL) -> London (LHR) + London Hotel
# Event:  AI101 (BOM->DEL) will be CANCELLED during demo
# ──────────────────────────────────────────────────────────────────────────────
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.itinerary import (
    User, TravelPreferences, Itinerary, TravelSegment, Flight, HotelBooking,
)
from app.core.logging import logger
import hashlib


def _hash_password(password: str) -> str:
    """Hash password matching the auth endpoint logic."""
    salted = f"routepilot_salt_{password}"
    return hashlib.sha256(salted.encode()).hexdigest()


def seed_demo_data(db: Session):
    """Idempotent seeder -- skips if TRIP-001 already exists."""
    existing = db.query(Itinerary).filter(Itinerary.id == "TRIP-002").first()
    if existing:
        logger.info("SEED  Demo data already exists -- skipping.")
        return

    logger.info("SEED  Populating demo scenario ...")

    # ── 1. User ─────────────────────────────────────────────────────────
    user = User(
        id="USR-001",
        name="Arjun Mehta",
        email="arjun.mehta@example.com",
        phone="+91-98765-43210",
        password_hash=_hash_password("arjun123"),
    )
    db.add(user)

    prefs = TravelPreferences(
        id="PREF-001",
        user_id="USR-001",
        autonomous_rebooking=True,
        autonomous_hotel_modification=True,
        preferred_cabin="ECONOMY",
        max_additional_fare=20000.0,
        currency="INR",
        min_connection_minutes=90,
    )
    db.add(prefs)

    # ── 2. Itinerary ────────────────────────────────────────────────────
    itinerary = Itinerary(
        id="TRIP-001",
        user_id="USR-001",
        trip_name="Mumbai - London Business Trip",
        start_date=datetime(2025, 6, 10, 10, 0),
        end_date=datetime(2025, 6, 13, 12, 0),
        status="ACTIVE",
    )
    db.add(itinerary)

    # ── 3. Segment 1: BOM -> DEL ────────────────────────────────────────
    seg1 = TravelSegment(
        id="SEG-001",
        itinerary_id="TRIP-001",
        segment_type="FLIGHT",
        sequence_order=1,
        booking_reference="PNR-ABC123",
    )
    db.add(seg1)

    flight1 = Flight(
        id="FLT-001",
        segment_id="SEG-001",
        airline="Air India",
        flight_number="AI101",
        origin="BOM",
        destination="DEL",
        scheduled_departure=datetime(2025, 6, 10, 10, 0),
        scheduled_arrival=datetime(2025, 6, 10, 12, 30),
        status="SCHEDULED",
        terminal="T2",
        gate="G14",
    )
    db.add(flight1)

    # ── 4. Segment 2: DEL -> LHR ────────────────────────────────────────
    seg2 = TravelSegment(
        id="SEG-002",
        itinerary_id="TRIP-001",
        segment_type="FLIGHT",
        sequence_order=2,
        booking_reference="PNR-ABC123",
    )
    db.add(seg2)

    flight2 = Flight(
        id="FLT-002",
        segment_id="SEG-002",
        airline="Air India",
        flight_number="AI203",
        origin="DEL",
        destination="LHR",
        scheduled_departure=datetime(2025, 6, 10, 15, 0),
        scheduled_arrival=datetime(2025, 6, 10, 20, 30),
        status="SCHEDULED",
        terminal="T3",
        gate="G22",
    )
    db.add(flight2)

    # ── 5. Hotel: London ────────────────────────────────────────────────
    hotel = HotelBooking(
        id="HTL-001",
        itinerary_id="TRIP-001",
        hotel_name="Hilton London Heathrow",
        location="London, United Kingdom",
        check_in=datetime(2025, 6, 10, 14, 0),
        check_out=datetime(2025, 6, 13, 12, 0),
        booking_reference="HLTN-789456",
        price=45000.0,
        currency="INR",
        status="CONFIRMED",
    )
    db.add(hotel)

    # ── 6. User 2 (Sarah Jenkins) ───────────────────────────────────────
    user2 = User(
        id="USR-002",
        name="Sarah Jenkins",
        email="sarah.j@example.com",
        phone="+1-555-0198",
        password_hash=_hash_password("sarah123"),
    )
    db.add(user2)

    prefs2 = TravelPreferences(
        id="PREF-002",
        user_id="USR-002",
        autonomous_rebooking=True,
        autonomous_hotel_modification=True,
        preferred_cabin="BUSINESS",
        max_additional_fare=500.0,
        currency="USD",
        min_connection_minutes=90,
    )
    db.add(prefs2)

    itinerary2 = Itinerary(
        id="TRIP-002",
        user_id="USR-002",
        trip_name="NYC - London Client Meeting",
        start_date=datetime(2025, 7, 15, 18, 0),
        end_date=datetime(2025, 7, 18, 12, 0),
        status="ACTIVE",
    )
    db.add(itinerary2)

    seg3 = TravelSegment(
        id="SEG-003",
        itinerary_id="TRIP-002",
        segment_type="FLIGHT",
        sequence_order=1,
        booking_reference="PNR-XYZ789",
    )
    db.add(seg3)

    flight3 = Flight(
        id="FLT-003",
        segment_id="SEG-003",
        airline="British Airways",
        flight_number="BA112",
        origin="JFK",
        destination="LHR",
        scheduled_departure=datetime(2025, 7, 15, 18, 30),
        scheduled_arrival=datetime(2025, 7, 16, 6, 30),
        status="SCHEDULED",
        terminal="T7",
        gate="G5",
    )
    db.add(flight3)

    hotel2 = HotelBooking(
        id="HTL-002",
        itinerary_id="TRIP-002",
        hotel_name="The Ritz London",
        location="London, United Kingdom",
        check_in=datetime(2025, 7, 16, 14, 0),
        check_out=datetime(2025, 7, 18, 11, 0),
        booking_reference="RITZ-123456",
        price=1200.0,
        currency="USD",
        status="CONFIRMED",
    )
    db.add(hotel2)

    db.commit()
    logger.info("SEED  Demo scenario ready - TRIP-001 (BOM -> DEL -> LHR + Hilton London)")
    logger.info("SEED    User: Arjun Mehta (USR-001)")
    logger.info("SEED    Flight AI101: BOM->DEL  10:00-12:30")
    logger.info("SEED    Flight AI203: DEL->LHR  15:00-20:30")
    logger.info("SEED    Hotel: Hilton London, Check-in June 10")
    logger.info("SEED  Demo scenario ready - TRIP-002 (JFK -> LHR + The Ritz London)")
    logger.info("SEED    User: Sarah Jenkins (USR-002)")
