# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Demo Data Seeder  --  Pre-populates the SRS core scenario
#
# 4 Travelers with distinct trips
# 2 Agencies
# ──────────────────────────────────────────────────────────────────────────────
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.itinerary import (
    User, TravelPreferences, Itinerary, TravelSegment, Flight, HotelBooking,
    Disruption, AlternativeFlight, RebookingRequest, Notification, AgentDecision, AuditLog
)
from app.core.logging import logger
import hashlib


def _hash_password(password: str) -> str:
    """Hash password matching the auth endpoint logic."""
    salted = f"routepilot_salt_{password}"
    return hashlib.sha256(salted.encode()).hexdigest()


def seed_demo_data(db: Session):
    """Wipes the database and populates fixed demo data."""
    logger.info("SEED  Wiping existing data for clean demo state...")
    
    # Clear all data in correct foreign-key order
    db.query(RebookingRequest).delete()
    db.query(AlternativeFlight).delete()
    db.query(AgentDecision).delete()
    db.query(Disruption).delete()
    db.query(Notification).delete()
    db.query(AuditLog).delete()
    db.query(HotelBooking).delete()
    db.query(Flight).delete()
    db.query(TravelSegment).delete()
    db.query(Itinerary).delete()
    db.query(TravelPreferences).delete()
    db.query(User).delete()
    db.commit()

    logger.info("SEED  Populating fixed demo scenario...")

    # Define base dates relative to today to keep the demo always "current"
    now = datetime.now()
    demo_start = now.replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=2)

    # ── 1. Agencies ─────────────────────────────────────────────────────────
    agencies = [
        User(id="USR-AGENCY-A", email="agency.alpha", name="Agency Alpha", password_hash=_hash_password("Agency@123"), role="COMPANY", company_name="Alpha Travels", airline_code="AA"),
        User(id="USR-AGENCY-B", email="agency.beta", name="Agency Beta", password_hash=_hash_password("Agency@456"), role="COMPANY", company_name="Beta Travels", airline_code="BB"),
    ]
    for a in agencies:
        db.add(a)

    # ── 2. Travelers ────────────────────────────────────────────────────────
    travelers_info = [
        {
            "id": "USR-TRV-A", "email": "traveler.ahmedabad", "name": "Traveler A", "pwd": "Travel@123",
            "trip_id": "TRIP-A", "trip_name": "Ahmedabad to Delhi Business Trip",
            "origin": "AMD", "dest": "DEL", "flight_num": "AI101",
            "hotel": "Hilton Delhi", "hotel_loc": "New Delhi, India"
        },
        {
            "id": "USR-TRV-B", "email": "traveler.mumbai", "name": "Traveler B", "pwd": "Travel@456",
            "trip_id": "TRIP-B", "trip_name": "Mumbai to Bengaluru Conf",
            "origin": "BOM", "dest": "BLR", "flight_num": "6E202",
            "hotel": "Taj West End", "hotel_loc": "Bengaluru, India"
        },
        {
            "id": "USR-TRV-C", "email": "traveler.delhi", "name": "Traveler C", "pwd": "Travel@789",
            "trip_id": "TRIP-C", "trip_name": "Delhi to London Summit",
            "origin": "DEL", "dest": "LHR", "flight_num": "BA303",
            "hotel": "The Ritz London", "hotel_loc": "London, UK"
        },
        {
            "id": "USR-TRV-D", "email": "traveler.bangalore", "name": "Traveler D", "pwd": "Travel@321",
            "trip_id": "TRIP-D", "trip_name": "Bengaluru to Mumbai Client Meet",
            "origin": "BLR", "dest": "BOM", "flight_num": "QP404",
            "hotel": "Oberoi Mumbai", "hotel_loc": "Mumbai, India"
        }
    ]

    for t in travelers_info:
        # User
        user = User(
            id=t["id"],
            name=t["name"],
            email=t["email"],
            password_hash=_hash_password(t["pwd"]),
            role="TRAVELER",
        )
        db.add(user)

        # Preferences
        prefs = TravelPreferences(
            id=f"PREF-{t['id']}",
            user_id=t["id"],
            autonomous_rebooking=True,
            autonomous_hotel_modification=True,
            preferred_cabin="ECONOMY",
            max_additional_fare=20000.0,
            currency="INR",
            min_connection_minutes=90,
        )
        db.add(prefs)

        # Itinerary
        itin = Itinerary(
            id=t["trip_id"],
            user_id=t["id"],
            trip_name=t["trip_name"],
            start_date=demo_start,
            end_date=demo_start + timedelta(days=3),
            status="ACTIVE",
        )
        db.add(itin)

        # Segment
        seg = TravelSegment(
            id=f"SEG-{t['trip_id']}-1",
            itinerary_id=t["trip_id"],
            segment_type="FLIGHT",
            sequence_order=1,
            booking_reference=f"PNR-{t['trip_id']}X",
        )
        db.add(seg)

        # Flight
        flight = Flight(
            id=f"FLT-{t['trip_id']}-1",
            segment_id=seg.id,
            airline="Demo Airlines",
            flight_number=t["flight_num"],
            origin=t["origin"],
            destination=t["dest"],
            scheduled_departure=demo_start,
            scheduled_arrival=demo_start + timedelta(hours=2, minutes=30),
            status="SCHEDULED",
            terminal="T1",
            gate="G10",
        )
        db.add(flight)

        # Hotel
        hotel = HotelBooking(
            id=f"HTL-{t['trip_id']}",
            itinerary_id=t["trip_id"],
            hotel_name=t["hotel"],
            location=t["hotel_loc"],
            check_in=demo_start + timedelta(hours=4),
            check_out=demo_start + timedelta(days=3),
            booking_reference=f"HTL-{t['trip_id']}X",
            price=15000.0,
            currency="INR",
            status="CONFIRMED",
        )
        db.add(hotel)

    db.commit()
    logger.info("SEED  Demo scenarios ready. 4 Travelers and 2 Agencies provisioned.")
