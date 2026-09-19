# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.schemas.rebooking import RebookingCreate, RebookingPreviewRequest
from app.services.rebooking.rebooking_service import RebookingService

router = APIRouter()


@router.post("/preview", response_model=ApiResponse)
def preview_rebooking(payload: RebookingPreviewRequest, db: Session = Depends(get_db)):
    """Preview rebooking options and fare comparison"""
    from app.models.itinerary import AlternativeFlight, Disruption
    alt = db.query(AlternativeFlight).filter(AlternativeFlight.id == payload.alternative_id).first()
    disruption = db.query(Disruption).filter(Disruption.id == payload.disruption_id).first()
    if not alt or not disruption:
        return ApiResponse(success=False, error=ApiError(code="NOT_FOUND", message="Alternative or disruption not found"))
    return ApiResponse(success=True, data={
        "disruption_id": disruption.id,
        "alternative": {
            "id": alt.id, "flight_number": alt.flight_number,
            "airline": alt.airline, "origin": alt.origin, "destination": alt.destination,
            "departure_time": alt.departure_time.isoformat() if alt.departure_time else None,
            "arrival_time": alt.arrival_time.isoformat() if alt.arrival_time else None,
            "additional_fare": alt.additional_fare,
            "policy_compliant": alt.policy_compliant,
            "score": alt.score, "recommended": alt.recommended,
        },
    })


@router.post("", response_model=ApiResponse)
def initiate_rebooking(payload: RebookingCreate, db: Session = Depends(get_db)):
    """Initiate idempotent rebooking action (FR-09)"""
    svc = RebookingService(db)
    result = svc.execute_rebooking(
        disruption_id=payload.disruption_id,
        alternative_id=payload.alternative_id,
        idempotency_key=payload.idempotency_key,
    )
    return ApiResponse(success=True, data=result)


@router.post("/{id}/approve", response_model=ApiResponse)
def approve_rebooking(id: str, db: Session = Depends(get_db)):
    """User approves alternative requiring confirmation (FR-10)"""
    svc = RebookingService(db)
    result = svc.approve(id)
    return ApiResponse(success=True, data=result)


@router.post("/{id}/reject", response_model=ApiResponse)
def reject_rebooking(id: str, db: Session = Depends(get_db)):
    """User rejects proposed rebooking"""
    svc = RebookingService(db)
    result = svc.reject(id)
    return ApiResponse(success=True, data=result)


@router.get("/{id}", response_model=ApiResponse)
def get_rebooking(id: str, db: Session = Depends(get_db)):
    """Status of rebooking action"""
    svc = RebookingService(db)
    result = svc.get_by_id(id)
    if not result:
        return ApiResponse(success=False, error=ApiError(code="REBOOKING_NOT_FOUND", message=f"Rebooking {id} not found"))
    return ApiResponse(success=True, data=result)
