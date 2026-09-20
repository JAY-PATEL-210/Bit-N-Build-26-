# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.hotel.hotel_service import HotelService
from app.utils.casing import to_camel_case

router = APIRouter()


@router.get("/itineraries/{itinerary_id}/hotels", response_model=ApiResponse)
def get_hotels(itinerary_id: str, db: Session = Depends(get_db)):
    """Associated hotel booking details"""
    svc = HotelService(db)
    hotels = svc.get_by_itinerary(itinerary_id)
    data = [
        to_camel_case({
            "id": h.id, "itinerary_id": h.itinerary_id,
            "hotel_name": h.hotel_name, "location": h.location,
            "check_in": h.check_in.isoformat() if h.check_in else None,
            "check_out": h.check_out.isoformat() if h.check_out else None,
            "booking_reference": h.booking_reference,
            "price": h.price, "currency": h.currency, "status": h.status,
        })
        for h in hotels
    ]
    return ApiResponse(success=True, data=data)


@router.post("/hotels/{id}/modify", response_model=ApiResponse)
def modify_hotel(id: str, payload: dict, db: Session = Depends(get_db)):
    """Modify hotel check-in/check-out dates"""
    from datetime import datetime
    svc = HotelService(db)
    check_in = None
    check_out = None
    
    # Support both snake_case and camelCase payloads
    check_in_val = payload.get("checkIn") or payload.get("check_in")
    check_out_val = payload.get("checkOut") or payload.get("check_out")
    
    if check_in_val:
        check_in = datetime.fromisoformat(check_in_val)
    if check_out_val:
        check_out = datetime.fromisoformat(check_out_val)
        
    hotel = svc.modify_hotel(id, check_in=check_in, check_out=check_out)
    if not hotel:
        return ApiResponse(success=False, error=ApiError(code="HOTEL_NOT_FOUND", message=f"Hotel {id} not found"))
    return ApiResponse(success=True, data=to_camel_case({
        "id": hotel.id, "hotel_name": hotel.hotel_name,
        "check_in": hotel.check_in.isoformat() if hotel.check_in else None,
        "check_out": hotel.check_out.isoformat() if hotel.check_out else None,
        "status": hotel.status,
    }))
