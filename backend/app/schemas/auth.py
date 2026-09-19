from typing import Optional, Any
from pydantic import BaseModel
from app.schemas.common import ApiResponse, ApiError  # noqa: F401 — canonical response


class SignupPayload(BaseModel):
    email: str
    role: str
    name: str
    phone: Optional[str] = None
    companyName: Optional[str] = None
    airlineCode: Optional[str] = None

class LoginPayload(BaseModel):
    email: str
    password: Optional[str] = None
    role: Optional[str] = "TRAVELER"

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    name: str
    phone: Optional[str] = None
    companyName: Optional[str] = None
    airlineCode: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
