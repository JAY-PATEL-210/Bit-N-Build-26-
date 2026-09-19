# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Audit Service  --  Immutable ledger of every system event (FR-13)
# ──────────────────────────────────────────────────────────────────────────────
from sqlalchemy.orm import Session
from app.models.itinerary import AuditLog
from app.utils.idempotency import generate_id
from app.core.logging import logger


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        itinerary_id: str,
        event: str,
        actor: str,
        action: str,
        result: str,
        decision_id: str = None,
        details: dict = None,
    ) -> AuditLog:
        entry = AuditLog(
            id=generate_id("AUD-"),
            itinerary_id=itinerary_id,
            event=event,
            actor=actor,
            action=action,
            result=result,
            decision_id=decision_id,
            details=details,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        logger.info(
            "AUDIT  %-28s  actor=%-10s  result=%-8s  itinerary=%s",
            event, actor, result, itinerary_id,
        )
        return entry

    def get_trail(self, itinerary_id: str) -> list[AuditLog]:
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.itinerary_id == itinerary_id)
            .order_by(AuditLog.timestamp.asc())
            .all()
        )
