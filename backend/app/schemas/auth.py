from typing import Optional
from pydantic import BaseModel

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

class ApiResponse(BaseModel):
    success: bool
    data: Optional[AuthResponse] = None
    error: Optional[str] = None
