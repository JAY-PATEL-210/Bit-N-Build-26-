# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Notification Service  --  Structured traveler alerts (FR-12)
# ──────────────────────────────────────────────────────────────────────────────
from typing import List
from sqlalchemy.orm import Session
from app.models.itinerary import Notification
from app.utils.idempotency import generate_id
from app.core.logging import logger


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        itinerary_id: str,
        user_id: str,
        title: str,
        message: str,
        notif_type: str = "INFO",
    ) -> Notification:
        notif = Notification(
            id=generate_id("NTF-"),
            itinerary_id=itinerary_id,
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        logger.info("NOTIFICATION  [%s] %s -> %s", notif_type, title, user_id)
        return notif

    def get_for_user(self, user_id: str) -> List[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    def get_all(self) -> List[Notification]:
        return (
            self.db.query(Notification)
            .order_by(Notification.created_at.desc())
            .all()
        )

    def mark_read(self, notification_id: str) -> Notification:
        notif = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.read = True
            self.db.commit()
            self.db.refresh(notif)
        return notif

    # ── Template helpers ────────────────────────────────────────────────────
    def notify_disruption_detected(self, itinerary_id: str, user_id: str, description: str):
        return self.create(
            itinerary_id=itinerary_id,
            user_id=user_id,
            title="[ALERT] Flight Disruption Detected",
            message=description,
            notif_type="WARNING",
        )

    def notify_rebooking_confirmed(self, itinerary_id: str, user_id: str, new_flight: str, details: str):
        return self.create(
            itinerary_id=itinerary_id,
            user_id=user_id,
            title="[CONFIRMED] Autonomous Rebooking Confirmed",
            message=f"You have been rebooked on {new_flight}. {details}",
            notif_type="SUCCESS",
        )

    def notify_approval_required(self, itinerary_id: str, user_id: str, reason: str):
        return self.create(
            itinerary_id=itinerary_id,
            user_id=user_id,
            title="[ACTION] Approval Required",
            message=f"Your action is needed: {reason}",
            notif_type="ACTION_REQUIRED",
        )

    def notify_hotel_modified(self, itinerary_id: str, user_id: str, details: str):
        return self.create(
            itinerary_id=itinerary_id,
            user_id=user_id,
            title="[HOTEL] Hotel Reservation Updated",
            message=details,
            notif_type="INFO",
        )
