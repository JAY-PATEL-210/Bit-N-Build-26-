# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.notification.notification_service import NotificationService

router = APIRouter()


@router.get("", response_model=ApiResponse)
def get_notifications(db: Session = Depends(get_db)):
    """Retrieve all traveler notification alerts (FR-12)"""
    svc = NotificationService(db)
    items = svc.get_all()
    data = [
        {
            "id": n.id, "itinerary_id": n.itinerary_id, "user_id": n.user_id,
            "title": n.title, "message": n.message, "type": n.type,
            "read": n.read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in items
    ]
    return ApiResponse(success=True, data=data)


@router.patch("/{id}/read", response_model=ApiResponse)
def mark_notification_read(id: str, db: Session = Depends(get_db)):
    """Mark notification as read"""
    svc = NotificationService(db)
    notif = svc.mark_read(id)
    if not notif:
        return ApiResponse(success=False, error=ApiError(code="NOT_FOUND", message=f"Notification {id} not found"))
    return ApiResponse(success=True, data={"id": notif.id, "read": notif.read})
