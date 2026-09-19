# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
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
def create_itinerary(payload: dict, db: Session = Depends(get_db)):
    """Create a new traveler itinerary (placeholder -- seed handles this for demo)"""
    return ApiResponse(success=True, data=payload)


@router.patch("/{id}", response_model=ApiResponse)
def update_itinerary(id: str, payload: dict, db: Session = Depends(get_db)):
    """Update an itinerary status"""
    svc = ItineraryService(db)
    status = payload.get("status")
    if status:
        svc.update_status(id, status)
    return ApiResponse(success=True, data={"id": id, **payload})

