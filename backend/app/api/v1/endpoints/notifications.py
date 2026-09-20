# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ApiResponse, ApiError
from app.services.notification.notification_service import NotificationService
from app.utils.casing import to_camel_case

router = APIRouter()


from typing import Optional

@router.get("", response_model=ApiResponse)
def get_notifications(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all traveler notification alerts (FR-12)"""
    svc = NotificationService(db)
    items = svc.get_all()
    if user_id:
        items = [i for i in items if i.user_id == user_id]
    data = [
        to_camel_case({
            "id": n.id, "itinerary_id": n.itinerary_id, "user_id": n.user_id,
            "title": n.title, "message": n.message, "type": n.type,
            "read": n.read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        })
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


@router.patch("/{id}/comment", response_model=ApiResponse)
def comment_on_notification(id: str, payload: dict, db: Session = Depends(get_db)):
    """Add a comment to a notification (Section 40 — Traveler Support)"""
    message = (payload.get("message") or "").strip()
    if not message:
        return ApiResponse(success=False, error=ApiError(code="VALIDATION_ERROR", message="Comment text cannot be empty."))

    # For now, return success with the comment acknowledged.
    # In production this would persist to a comments table.
    return ApiResponse(success=True, data={
        "id": id,
        "message": message,
        "comments": [message],
    })

