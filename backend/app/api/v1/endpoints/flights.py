# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.flight_monitor.flight_monitor_service import FlightMonitorService
from app.services.disruption.disruption_service import DisruptionService
from app.models.itinerary import Flight, TravelSegment
from app.utils.casing import to_camel_case
from app.utils.idempotency import generate_id

router = APIRouter()


def _flight_to_dict(flight: Flight) -> dict:
    return to_camel_case({
        "id": flight.id, "flight_number": flight.flight_number,
        "airline": flight.airline, "origin": flight.origin, "destination": flight.destination,
        "scheduled_departure": flight.scheduled_departure.isoformat() if flight.scheduled_departure else None,
        "scheduled_arrival": flight.scheduled_arrival.isoformat() if flight.scheduled_arrival else None,
        "estimated_departure": flight.estimated_departure.isoformat() if flight.estimated_departure else None,
        "estimated_arrival": flight.estimated_arrival.isoformat() if flight.estimated_arrival else None,
        "status": flight.status, "terminal": flight.terminal, "gate": flight.gate,
    })


@router.get("", response_model=ApiResponse)
def get_flights(db: Session = Depends(get_db)):
    """Retrieve all flights"""
    flights = db.query(Flight).all()
    data = [_flight_to_dict(f) for f in flights]
    return ApiResponse(success=True, data=data)


@router.get("/{id}", response_model=ApiResponse)
def get_flight(id: str, db: Session = Depends(get_db)):
    """Get flight information"""
    svc = FlightMonitorService(db)
    flight = svc.get_flight(id)
    if not flight:
        return ApiResponse(success=False, error=ApiError(code="FLIGHT_NOT_FOUND", message=f"Flight {id} not found"))
    return ApiResponse(success=True, data=_flight_to_dict(flight))


@router.get("/{id}/status", response_model=ApiResponse)
def get_flight_status(id: str, db: Session = Depends(get_db)):
    """Live flight status (FR-03)"""
    svc = FlightMonitorService(db)
    status = svc.get_status(id)
    if not status:
        return ApiResponse(success=False, error=ApiError(code="FLIGHT_NOT_FOUND", message=f"Flight {id} not found"))
    return ApiResponse(success=True, data=to_camel_case(status))


@router.post("", response_model=ApiResponse)
def create_flight(payload: dict, db: Session = Depends(get_db)):
    """Create a new flight (Company action) with proper segment linkage."""
    from datetime import datetime
    
    # Determine itinerary to link to
    itinerary_id = payload.get("itineraryId") or payload.get("itinerary_id")
    if not itinerary_id:
        # Link to the first available itinerary (demo mode)
        from app.models.itinerary import Itinerary
        first_itin = db.query(Itinerary).first()
        if first_itin:
            itinerary_id = first_itin.id
    
    # Create TravelSegment first
    seg_id = generate_id("SEG-")
    if itinerary_id:
        # Determine next sequence order
        existing_count = db.query(TravelSegment).filter(
            TravelSegment.itinerary_id == itinerary_id
        ).count()
        segment = TravelSegment(
            id=seg_id,
            itinerary_id=itinerary_id,
            segment_type="FLIGHT",
            sequence_order=existing_count + 1,
            booking_reference=payload.get("bookingReference") or payload.get("booking_reference"),
        )
        db.add(segment)
    
    flight = Flight(
        id=generate_id("FLT-"),
        segment_id=seg_id,
        airline=payload.get("airline", "Unknown"),
        flight_number=payload.get("flightNumber", payload.get("flight_number", "")),
        origin=payload.get("origin", ""),
        destination=payload.get("destination", ""),
        scheduled_departure=datetime.fromisoformat(payload["scheduledDeparture"]) if payload.get("scheduledDeparture") else (datetime.fromisoformat(payload["scheduled_departure"]) if payload.get("scheduled_departure") else datetime.now()),
        scheduled_arrival=datetime.fromisoformat(payload["scheduledArrival"]) if payload.get("scheduledArrival") else (datetime.fromisoformat(payload["scheduled_arrival"]) if payload.get("scheduled_arrival") else datetime.now()),
        status="SCHEDULED",
        terminal=payload.get("terminal"),
        gate=payload.get("gate"),
    )
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return ApiResponse(success=True, data=_flight_to_dict(flight))


@router.post("/{id}/cancel", response_model=ApiResponse)
def cancel_flight(id: str, payload: dict, db: Session = Depends(get_db)):
    """Cancel a flight (Company action) — triggers disruption pipeline"""
    flight = db.query(Flight).filter(Flight.id == id).first()
    if not flight:
        # Try by flight_number
        flight = db.query(Flight).filter(Flight.flight_number == id).first()
    if not flight:
        return ApiResponse(success=False, error=ApiError(code="FLIGHT_NOT_FOUND", message=f"Flight {id} not found"))

    flight.status = "CANCELLED"
    db.commit()
    db.refresh(flight)

    # Trigger disruption if itinerary can be found
    segment = db.query(TravelSegment).filter(TravelSegment.id == flight.segment_id).first()
    if segment:
        try:
            svc = DisruptionService(db)
            svc.simulate_disruption(
                event_type="CANCELLATION",
                flight_id=flight.id,
                itinerary_id=segment.itinerary_id,
            )
        except Exception:
            pass  # disruption creation is best-effort here

    return ApiResponse(success=True, data=_flight_to_dict(flight))


@router.post("/{id}/delay", response_model=ApiResponse)
def delay_flight(id: str, payload: dict, db: Session = Depends(get_db)):
    """Delay a flight (Company action) — triggers disruption pipeline"""
    from datetime import datetime
    flight = db.query(Flight).filter(Flight.id == id).first()
    if not flight:
        flight = db.query(Flight).filter(Flight.flight_number == id).first()
    if not flight:
        return ApiResponse(success=False, error=ApiError(code="FLIGHT_NOT_FOUND", message=f"Flight {id} not found"))

    new_dep = payload.get("newDepartureTime") or payload.get("new_departure_time")
    new_arr = payload.get("newArrivalTime") or payload.get("new_arrival_time")

    if new_dep:
        flight.estimated_departure = datetime.fromisoformat(new_dep)
    if new_arr:
        flight.estimated_arrival = datetime.fromisoformat(new_arr)
    flight.status = "DELAYED"
    db.commit()
    db.refresh(flight)

    # Calculate delay minutes and trigger disruption
    delay_minutes = 0
    if flight.scheduled_departure and flight.estimated_departure:
        delay_minutes = int((flight.estimated_departure - flight.scheduled_departure).total_seconds() / 60)

    segment = db.query(TravelSegment).filter(TravelSegment.id == flight.segment_id).first()
    if segment and delay_minutes > 0:
        try:
            svc = DisruptionService(db)
            svc.simulate_disruption(
                event_type="DELAY",
                flight_id=flight.id,
                itinerary_id=segment.itinerary_id,
                delay_minutes=delay_minutes,
            )
        except Exception:
            pass

    return ApiResponse(success=True, data=_flight_to_dict(flight))

