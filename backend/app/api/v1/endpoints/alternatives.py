# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.models.itinerary import AlternativeFlight
from app.utils.casing import to_camel_case

router = APIRouter()

@router.get("/{id}", response_model=ApiResponse)
def get_alternative_by_id(id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific alternative flight"""
    alt = db.query(AlternativeFlight).filter(AlternativeFlight.id == id).first()
    if not alt:
        return ApiResponse(success=False, error=ApiError(code="NOT_FOUND", message=f"Alternative {id} not found"))
        
    return ApiResponse(success=True, data=to_camel_case({
        "id": alt.id,
        "disruption_id": alt.disruption_id,
        "airline": alt.airline,
        "flight_number": alt.flight_number,
        "origin": alt.origin,
        "destination": alt.destination,
        "departure_time": alt.departure_time.isoformat() if alt.departure_time else None,
        "arrival_time": alt.arrival_time.isoformat() if alt.arrival_time else None,
        "stops": alt.stops,
        "additional_fare": alt.additional_fare,
        "currency": alt.currency,
        "score": alt.score,
        "explanation": alt.explanation,
        "recommended": alt.recommended,
    }))
