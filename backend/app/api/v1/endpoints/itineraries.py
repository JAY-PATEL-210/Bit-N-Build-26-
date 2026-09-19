# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("", response_model=ApiResponse)
def get_itineraries():
    """Retrieve all active itineraries (FR-02)"""
    return ApiResponse(success=True, data=[])

@router.get("/{id}", response_model=ApiResponse)
def get_itinerary(id: str):
    """Retrieve a specific itinerary by ID"""
    return ApiResponse(success=True, data={"id": id})

@router.post("", response_model=ApiResponse)
def create_itinerary(payload: dict):
    """Create a new traveler itinerary"""
    return ApiResponse(success=True, data=payload)

@router.patch("/{id}", response_model=ApiResponse)
def update_itinerary(id: str, payload: dict):
    """Update an itinerary"""
    return ApiResponse(success=True, data={"id": id, **payload})
