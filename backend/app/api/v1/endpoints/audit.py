# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.audit.audit_service import AuditService
from app.utils.casing import to_camel_case

router = APIRouter()


@router.get("/itineraries/{itinerary_id}/audit", response_model=ApiResponse)
def get_audit_trail(itinerary_id: str, db: Session = Depends(get_db)):
    """Complete audit trail of system events and decisions (FR-13)"""
    svc = AuditService(db)
    entries = svc.get_trail(itinerary_id)
    data = []
    for e in entries:
        entry_dict = {
            "id": e.id, "itinerary_id": e.itinerary_id,
            "event": e.event, "actor": e.actor,
            "decision_id": e.decision_id,
            "action": e.action, "result": e.result,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
        }
        if e.details:
            entry_dict["decision"] = e.details.get("decision")
            entry_dict["reason"] = e.details.get("reason")
            entry_dict["reasonCodes"] = e.details.get("reasonCodes")
            entry_dict["confidence"] = e.details.get("confidence")
            # If 'metadata' key is inside details, use it, else pass details itself
            entry_dict["metadata"] = e.details.get("metadata", e.details)
        data.append(to_camel_case(entry_dict))
    return ApiResponse(success=True, data=data)
