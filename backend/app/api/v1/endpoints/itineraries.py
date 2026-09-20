# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.schemas.itinerary import ItineraryCreateRequest, ItineraryUpdateRequest
from app.services.itinerary.itinerary_service import ItineraryService
from app.utils.casing import to_camel_case

router = APIRouter()


@router.get("", response_model=ApiResponse)
def get_itineraries(db: Session = Depends(get_db)):
    """Retrieve all active itineraries (FR-02)"""
    svc = ItineraryService(db)
    items = svc.get_all()
    data = [
        to_camel_case({
            "id": i.id, "user_id": i.user_id, "trip_name": i.trip_name,
            "start_date": i.start_date.isoformat() if i.start_date else None,
            "end_date": i.end_date.isoformat() if i.end_date else None,
            "status": i.status,
        })
        for i in items
    ]
    return ApiResponse(success=True, data=data)


@router.get("/{id}", response_model=ApiResponse)
def get_itinerary(id: str, db: Session = Depends(get_db)):
    """Retrieve a specific itinerary with full flight + hotel details"""
    svc = ItineraryService(db)
    detail = svc.get_detail(id)
    if not detail:
        return ApiResponse(success=False, error=ApiError(code="ITINERARY_NOT_FOUND", message=f"Itinerary {id} not found"))
    return ApiResponse(success=True, data=to_camel_case(detail))


@router.post("", response_model=ApiResponse)
def create_itinerary(payload: ItineraryCreateRequest, db: Session = Depends(get_db)):
    """Create a new traveler itinerary"""
    svc = ItineraryService(db)
    
    # Convert FlightInput to dict for the service
    flights = [
        {
            "airline": f.airline,
            "flight_number": f.flight_number,
            "origin": f.origin,
            "destination": f.destination,
            "scheduled_departure": f.scheduled_departure,
            "scheduled_arrival": f.scheduled_arrival,
            "terminal": f.terminal,
            "gate": f.gate,
            "booking_reference": f.booking_reference,
        }
        for f in payload.flights
    ]
    
    # Convert HotelInput to dict
    hotels = [
        {
            "hotel_name": h.hotel_name,
            "location": h.location,
            "check_in": h.check_in,
            "check_out": h.check_out,
            "booking_reference": h.booking_reference,
            "price": h.price,
            "currency": h.currency,
        }
        for h in payload.hotels
    ]
    
    itin = svc.create_itinerary(
        user_id=payload.user_id,
        trip_name=payload.trip_name,
        start_date=payload.start_date,
        end_date=payload.end_date,
        flights=flights,
        hotels=hotels,
    )
    
    return ApiResponse(success=True, data=to_camel_case({
        "id": itin.id,
        "user_id": itin.user_id,
        "trip_name": itin.trip_name,
        "status": itin.status,
    }))


@router.patch("/{id}", response_model=ApiResponse)
def update_itinerary(id: str, payload: ItineraryUpdateRequest, db: Session = Depends(get_db)):
    """Update an itinerary"""
    svc = ItineraryService(db)
    try:
        itin = svc.update_itinerary(id, payload.model_dump(exclude_unset=True))
        if not itin:
            return ApiResponse(success=False, error=ApiError(code="ITINERARY_NOT_FOUND", message=f"Itinerary {id} not found"))
        return ApiResponse(success=True, data=to_camel_case({"id": itin.id, "status": itin.status}))
    except ValueError as e:
        return ApiResponse(success=False, error=ApiError(code="VALIDATION_ERROR", message=str(e)))

