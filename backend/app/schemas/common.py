# Owner: Member C (Backend Lead / Core Services)
# Canonical enums and standard API response envelope
from enum import Enum
from typing import Generic, Optional, TypeVar, Any, List
from pydantic import BaseModel

T = TypeVar("T")


# ── Flight Status ───────────────────────────────────────────────────────────
class FlightStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    DELAYED = "DELAYED"
    BOARDING = "BOARDING"
    DEPARTED = "DEPARTED"
    ARRIVED = "ARRIVED"
    CANCELLED = "CANCELLED"


# ── Disruption ──────────────────────────────────────────────────────────────
class DisruptionType(str, Enum):
    NONE = "NONE"
    DELAY = "DELAY"
    CANCELLATION = "CANCELLATION"
    MISSED_CONNECTION = "MISSED_CONNECTION"
    CONNECTION_RISK = "CONNECTION_RISK"
    AIRPORT_CHANGE = "AIRPORT_CHANGE"
    ROUTE_CHANGE = "ROUTE_CHANGE"
    UNKNOWN = "UNKNOWN"


class DisruptionSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# ── Rebooking ───────────────────────────────────────────────────────────────
class RebookingStatus(str, Enum):
    PENDING = "PENDING"
    ANALYZING = "ANALYZING"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PROCESSING = "PROCESSING"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


# ── Hotel Action ────────────────────────────────────────────────────────────
class HotelAction(str, Enum):
    NO_ACTION = "NO_ACTION"
    MODIFY_CHECKIN = "MODIFY_CHECKIN"
    MODIFY_CHECKOUT = "MODIFY_CHECKOUT"
    CANCEL = "CANCEL"
    REBOOK = "REBOOK"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"


# ── Itinerary Status ────────────────────────────────────────────────────────
class ItineraryStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DISRUPTED = "DISRUPTED"
    RESOLVED = "RESOLVED"
    COMPLETED = "COMPLETED"


# ── Audit Actor ─────────────────────────────────────────────────────────────
class AuditActor(str, Enum):
    USER = "USER"
    AI_AGENT = "AI_AGENT"
    SYSTEM = "SYSTEM"
    EXTERNAL_API = "EXTERNAL_API"
    ADMIN = "ADMIN"


# ── Standard API Response Envelope ──────────────────────────────────────────
class ApiError(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ApiError] = None
