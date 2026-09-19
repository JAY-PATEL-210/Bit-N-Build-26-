# Owner: Member C (Backend Lead / Core Services)
# Sections 18 & 19: Core Domain Enums and Canonical API Response Contract
from enum import Enum
from typing import Generic, Optional, TypeVar, Any
from pydantic import BaseModel

T = TypeVar("T")

class FlightStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    DELAYED = "DELAYED"
    BOARDING = "BOARDING"
    DEPARTED = "DEPARTED"
    ARRIVED = "ARRIVED"
    CANCELLED = "CANCELLED"

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

class HotelAction(str, Enum):
    NO_ACTION = "NO_ACTION"
    MODIFY_CHECKIN = "MODIFY_CHECKIN"
    MODIFY_CHECKOUT = "MODIFY_CHECKOUT"
    CANCEL = "CANCEL"
    REBOOK = "REBOOK"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"

class ApiError(BaseModel):
    code: str
    message: str

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ApiError] = None
