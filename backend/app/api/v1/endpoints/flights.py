# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.flight_monitor.flight_monitor_service import FlightMonitorService

router = APIRouter()


@router.get("/{id}", response_model=ApiResponse)
def get_flight(id: str, db: Session = Depends(get_db)):
    """Get flight information"""
    svc = FlightMonitorService(db)
    flight = svc.get_flight(id)
    if not flight:
        return ApiResponse(success=False, error=ApiError(code="FLIGHT_NOT_FOUND", message=f"Flight {id} not found"))
    return ApiResponse(success=True, data={
        "id": flight.id, "flight_number": flight.flight_number,
        "airline": flight.airline, "origin": flight.origin, "destination": flight.destination,
        "scheduled_departure": flight.scheduled_departure.isoformat() if flight.scheduled_departure else None,
        "scheduled_arrival": flight.scheduled_arrival.isoformat() if flight.scheduled_arrival else None,
        "estimated_departure": flight.estimated_departure.isoformat() if flight.estimated_departure else None,
        "estimated_arrival": flight.estimated_arrival.isoformat() if flight.estimated_arrival else None,
        "status": flight.status, "terminal": flight.terminal, "gate": flight.gate,
    })


@router.get("/{id}/status", response_model=ApiResponse)
def get_flight_status(id: str, db: Session = Depends(get_db)):
    """Live flight status (FR-03)"""
    svc = FlightMonitorService(db)
    status = svc.get_status(id)
    if not status:
        return ApiResponse(success=False, error=ApiError(code="FLIGHT_NOT_FOUND", message=f"Flight {id} not found"))
    return ApiResponse(success=True, data=status)
