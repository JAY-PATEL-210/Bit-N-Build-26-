# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.audit.audit_service import AuditService

router = APIRouter()


@router.get("/itineraries/{itinerary_id}/audit", response_model=ApiResponse)
def get_audit_trail(itinerary_id: str, db: Session = Depends(get_db)):
    """Complete audit trail of system events and decisions (FR-13)"""
    svc = AuditService(db)
    entries = svc.get_trail(itinerary_id)
    data = [
        {
            "id": e.id, "itinerary_id": e.itinerary_id,
            "event": e.event, "actor": e.actor,
            "decision_id": e.decision_id,
            "action": e.action, "result": e.result,
            "details": e.details,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
        }
        for e in entries
    ]
    return ApiResponse(success=True, data=data)
