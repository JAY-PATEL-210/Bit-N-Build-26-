# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("/{id}", response_model=ApiResponse)
def get_alternative_by_id(id: str):
    """Retrieve details for a specific alternative flight"""
    return ApiResponse(success=True, data={"id": id})
