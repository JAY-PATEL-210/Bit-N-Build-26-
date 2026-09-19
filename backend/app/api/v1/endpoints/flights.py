# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("/{id}", response_model=ApiResponse)
def get_flight(id: str):
    """Get flight details"""
    return ApiResponse(success=True, data={"id": id})

@router.get("/{id}/status", response_model=ApiResponse)
def get_flight_status(id: str):
    """Get live status of monitored flight (FR-03)"""
    return ApiResponse(success=True, data={"id": id, "status": "SCHEDULED"})
