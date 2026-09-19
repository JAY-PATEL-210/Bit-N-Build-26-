# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("", response_model=ApiResponse)
def get_disruptions():
    """Retrieve all disruptions"""
    return ApiResponse(success=True, data=[])

@router.get("/{id}", response_model=ApiResponse)
def get_disruption(id: str):
    """Retrieve disruption details and affected downstream legs"""
    return ApiResponse(success=True, data={"id": id})

@router.get("/{id}/alternatives", response_model=ApiResponse)
def get_alternatives(id: str):
    """Retrieve ranked alternative flights for disruption (FR-06, FR-07)"""
    return ApiResponse(success=True, data=[])

@router.post("/simulate", response_model=ApiResponse)
def simulate_disruption(payload: dict):
    """Simulate a flight disruption event for testing and judge demo (Feature 6)"""
    return ApiResponse(success=True, data={"status": "TRIGGERED", "event": payload})
