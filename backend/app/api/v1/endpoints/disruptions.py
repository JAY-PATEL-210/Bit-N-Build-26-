# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.schemas.disruption import SimulateDisruptionRequest
from app.services.disruption.disruption_service import DisruptionService
from app.utils.casing import to_camel_case

router = APIRouter()


@router.get("", response_model=ApiResponse)
def get_disruptions(db: Session = Depends(get_db)):
    """Retrieve all active disruptions"""
    svc = DisruptionService(db)
    items = svc.get_all_active()
    data = [
        to_camel_case({
            "id": d.id, "itinerary_id": d.itinerary_id, "segment_id": d.segment_id,
            "type": d.type, "severity": d.severity,
            "detected_at": d.detected_at.isoformat() if d.detected_at else None,
            "description": d.description, "impact": d.impact,
            "affected_segments": d.affected_segments, "status": d.status,
        })
        for d in items
    ]
    return ApiResponse(success=True, data=data)


@router.get("/{id}", response_model=ApiResponse)
def get_disruption(id: str, db: Session = Depends(get_db)):
    """Disruption details and impact assessment"""
    svc = DisruptionService(db)
    d = svc.get_by_id(id)
    if not d:
        return ApiResponse(success=False, error=ApiError(code="DISRUPTION_NOT_FOUND", message=f"Disruption {id} not found"))
    return ApiResponse(success=True, data=to_camel_case({
        "id": d.id, "itinerary_id": d.itinerary_id, "segment_id": d.segment_id,
        "type": d.type, "severity": d.severity,
        "detected_at": d.detected_at.isoformat() if d.detected_at else None,
        "source": d.source, "description": d.description, "impact": d.impact,
        "affected_segments": d.affected_segments, "status": d.status,
    }))


@router.get("/{id}/alternatives", response_model=ApiResponse)
def get_alternatives(id: str, db: Session = Depends(get_db)):
    """Retrieve ranked alternative flights for disruption (FR-06, FR-07)"""
    svc = DisruptionService(db)
    alts = svc.get_alternatives(id)
    data = [
        to_camel_case({
            "id": a.id, "disruption_id": a.disruption_id,
            "airline": a.airline, "flight_number": a.flight_number,
            "origin": a.origin, "destination": a.destination,
            "departure_time": a.departure_time.isoformat() if a.departure_time else None,
            "arrival_time": a.arrival_time.isoformat() if a.arrival_time else None,
            "duration_minutes": a.duration_minutes, "stops": a.stops,
            "additional_fare": a.additional_fare, "currency": a.currency,
            "policy_compliant": a.policy_compliant,
            "policy_violations": a.policy_violations,
            "score": a.score, "explanation": a.explanation,
            "recommended": a.recommended,
        })
        for a in alts
    ]
    return ApiResponse(success=True, data=data)


@router.post("/simulate", response_model=ApiResponse)
def simulate_disruption(payload: SimulateDisruptionRequest, db: Session = Depends(get_db)):
    """
    Simulate a flight disruption event (cancellation/delay).
    This is the MAIN DEMO TRIGGER -- judges press this to kick off the full pipeline.
    """
    svc = DisruptionService(db)
    try:
        disruption = svc.simulate_disruption(
            event_type=payload.event_type,
            flight_id=payload.flight_id,
            itinerary_id=payload.itinerary_id,
            delay_minutes=payload.delay_minutes or 0,
        )
        return ApiResponse(success=True, data=to_camel_case({
            "disruption_id": disruption.id,
            "type": disruption.type,
            "severity": disruption.severity,
            "description": disruption.description,
            "impact": disruption.impact,
            "affected_segments": disruption.affected_segments,
            "status": disruption.status,
        }))
    except ValueError as e:
        return ApiResponse(success=False, error=ApiError(code="SIMULATION_ERROR", message=str(e)))
