# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Rebooking Service  --  Idempotent state-machine workflow (FR-09, FR-10)
# Section 37 & 38: Zero duplicate bookings guaranteed.
# ──────────────────────────────────────────────────────────────────────────────
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.itinerary import (
    RebookingRequest, AlternativeFlight, Disruption, Flight, TravelSegment, Itinerary,
)
from app.repositories.rebooking_repository import RebookingRepository
from app.services.policy.policy_engine import PolicyEngine
from app.services.hotel.hotel_service import HotelService
from app.services.notification.notification_service import NotificationService
from app.services.audit.audit_service import AuditService
from app.utils.idempotency import generate_id
from app.core.logging import logger


class RebookingService:
    """
    Full idempotent rebooking workflow with DB-backed state machine.

    State transitions:
      PENDING -> ANALYZING -> APPROVAL_REQUIRED -> APPROVED -> PROCESSING -> CONFIRMED
                                                                       -> FAILED
                                                REJECTED -> (end)
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = RebookingRepository(db)
        self.hotel_svc = HotelService(db)
        self.notif_svc = NotificationService(db)
        self.audit_svc = AuditService(db)

    # ── Idempotent Execute ──────────────────────────────────────────────────
    def execute_rebooking(
        self,
        disruption_id: str,
        alternative_id: str,
        idempotency_key: str,
    ) -> dict:
        """
        Main entry point. Idempotent -- duplicate keys return existing record.
        """
        # Idempotency check: return existing if already processed
        existing = self.repo.get_by_idempotency_key(idempotency_key)
        if existing:
            logger.info("REBOOKING  Duplicate key %s -> returning existing %s", idempotency_key, existing.id)
            return {
                "id": existing.id,
                "status": existing.status,
                "booking_reference": existing.booking_reference,
                "idempotency_key": idempotency_key,
                "message": "Duplicate request; returning existing booking record.",
                "is_duplicate": True,
            }

        # Fetch the alternative and disruption
        alternative = self.db.query(AlternativeFlight).filter(AlternativeFlight.id == alternative_id).first()
        if not alternative:
            return {"status": "FAILED", "message": f"Alternative {alternative_id} not found"}

        disruption = self.db.query(Disruption).filter(Disruption.id == disruption_id).first()
        if not disruption:
            return {"status": "FAILED", "message": f"Disruption {disruption_id} not found"}

        # Create the rebooking request
        rebooking = RebookingRequest(
            id=generate_id("RBK-"),
            disruption_id=disruption_id,
            alternative_id=alternative_id,
            idempotency_key=idempotency_key,
            status="PENDING",
        )
        self.db.add(rebooking)
        self.db.commit()

        # Move to ANALYZING
        self._transition(rebooking, "ANALYZING")

        # ── Policy Gate ─────────────────────────────────────────────────
        itinerary = self.db.query(Itinerary).filter(Itinerary.id == disruption.itinerary_id).first()
        user_prefs = itinerary.user.preferences if itinerary and itinerary.user else None

        if user_prefs:
            policy = PolicyEngine.from_preferences(user_prefs)
            alt_dict = {
                "additional_fare": alternative.additional_fare,
                "stops": alternative.stops,
            }
            needs_approval = policy.requires_human_approval(alt_dict)

            if needs_approval:
                self._transition(rebooking, "APPROVAL_REQUIRED")
                self.notif_svc.notify_approval_required(
                    itinerary_id=disruption.itinerary_id,
                    user_id=itinerary.user_id,
                    reason=f"Rebooking on {alternative.flight_number} requires your approval (fare: Rs.{alternative.additional_fare:,.0f})",
                )
                self.audit_svc.log(
                    itinerary_id=disruption.itinerary_id,
                    event="REBOOKING_ESCALATED",
                    actor="SYSTEM",
                    action=f"Rebooking {rebooking.id} requires human approval",
                    result="PENDING",
                    details={"rebooking_id": rebooking.id, "alternative_id": alternative_id},
                )
                return self._to_dict(rebooking)
        
        # ── Execute Booking ─────────────────────────────────────────────
        return self._confirm_booking(rebooking, alternative, disruption)

    # ── Approve / Reject ────────────────────────────────────────────────────
    def approve(self, rebooking_id: str) -> dict:
        rebooking = self.repo.get_by_id(rebooking_id)
        if not rebooking:
            return {"status": "FAILED", "message": "Rebooking not found"}
        if rebooking.status != "APPROVAL_REQUIRED":
            return {"status": rebooking.status, "message": f"Cannot approve from status {rebooking.status}"}

        self._transition(rebooking, "APPROVED")
        alternative = self.db.query(AlternativeFlight).filter(AlternativeFlight.id == rebooking.alternative_id).first()
        disruption = self.db.query(Disruption).filter(Disruption.id == rebooking.disruption_id).first()
        return self._confirm_booking(rebooking, alternative, disruption)

    def reject(self, rebooking_id: str) -> dict:
        rebooking = self.repo.get_by_id(rebooking_id)
        if not rebooking:
            return {"status": "FAILED", "message": "Rebooking not found"}

        self._transition(rebooking, "REJECTED")
        disruption = self.db.query(Disruption).filter(Disruption.id == rebooking.disruption_id).first()
        if disruption:
            self.audit_svc.log(
                itinerary_id=disruption.itinerary_id,
                event="REBOOKING_REJECTED",
                actor="USER",
                action=f"User rejected rebooking {rebooking_id}",
                result="REJECTED",
            )
        return self._to_dict(rebooking)

    def get_by_id(self, rebooking_id: str) -> Optional[dict]:
        rebooking = self.repo.get_by_id(rebooking_id)
        if not rebooking:
            return None
        return self._to_dict(rebooking)

    # ── Internal: Confirm Booking ───────────────────────────────────────────
    def _confirm_booking(self, rebooking: RebookingRequest, alternative: AlternativeFlight, disruption: Disruption) -> dict:
        self._transition(rebooking, "PROCESSING")

        # Generate confirmation code
        booking_ref = f"CONF-{rebooking.idempotency_key[-6:].upper()}"
        rebooking.booking_reference = booking_ref
        rebooking.confirmed_at = datetime.now(timezone.utc)
        self._transition(rebooking, "CONFIRMED")

        # ── Cascade: Hotel modification ─────────────────────────────────
        hotel_mods = []
        if alternative.arrival_time:
            hotel_mods = self.hotel_svc.recalculate_checkin(
                itinerary_id=disruption.itinerary_id,
                new_arrival_time=alternative.arrival_time,
            )

        # ── Update itinerary status ─────────────────────────────────────
        itinerary = self.db.query(Itinerary).filter(Itinerary.id == disruption.itinerary_id).first()
        if itinerary:
            itinerary.status = "RESOLVED"
            self.db.commit()

        # ── Resolve disruption ──────────────────────────────────────────
        disruption.status = "RESOLVED"
        self.db.commit()

        # ── Notifications ───────────────────────────────────────────────
        if itinerary:
            self.notif_svc.notify_rebooking_confirmed(
                itinerary_id=disruption.itinerary_id,
                user_id=itinerary.user_id,
                new_flight=f"{alternative.airline} {alternative.flight_number}",
                details=f"Booking ref: {booking_ref}. Departs {alternative.departure_time.strftime('%d %b, %H:%M') if alternative.departure_time else 'TBD'}.",
            )
            if hotel_mods:
                for mod in hotel_mods:
                    if mod.get("action") != "NO_ACTION":
                        self.notif_svc.notify_hotel_modified(
                            itinerary_id=disruption.itinerary_id,
                            user_id=itinerary.user_id,
                            details=f"{mod['hotel_name']} check-in changed: {mod.get('reason', '')}",
                        )

        # ── Audit ───────────────────────────────────────────────────────
        self.audit_svc.log(
            itinerary_id=disruption.itinerary_id,
            event="REBOOKING_CONFIRMED",
            actor="SYSTEM",
            action=f"Rebooked on {alternative.flight_number}, ref: {booking_ref}",
            result="SUCCESS",
            details={
                "rebooking_id": rebooking.id,
                "booking_reference": booking_ref,
                "alternative_id": alternative.id,
                "hotel_modifications": hotel_mods,
            },
        )

        logger.info(
            "REBOOKING  %s CONFIRMED  ref=%s  flight=%s",
            rebooking.id, booking_ref, alternative.flight_number,
        )
        result = self._to_dict(rebooking)
        result["hotel_modifications"] = hotel_mods
        return result

    # ── Helpers ─────────────────────────────────────────────────────────────
    def _transition(self, rebooking: RebookingRequest, new_status: str):
        old = rebooking.status
        rebooking.status = new_status
        rebooking.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(rebooking)
        logger.info("REBOOKING  %s  %s -> %s", rebooking.id, old, new_status)

    def _to_dict(self, rebooking: RebookingRequest) -> dict:
        return {
            "id": rebooking.id,
            "disruption_id": rebooking.disruption_id,
            "alternative_id": rebooking.alternative_id,
            "idempotency_key": rebooking.idempotency_key,
            "status": rebooking.status,
            "booking_reference": rebooking.booking_reference,
            "created_at": rebooking.created_at.isoformat() if rebooking.created_at else None,
            "confirmed_at": rebooking.confirmed_at.isoformat() if rebooking.confirmed_at else None,
            "is_duplicate": False,
        }
