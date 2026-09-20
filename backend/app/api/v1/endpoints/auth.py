import time
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.itinerary import User
from app.schemas.auth import SignupPayload, LoginPayload, AuthResponse, UserResponse
from app.schemas.common import ApiResponse, ApiError

router = APIRouter()


def _generate_user_id() -> str:
    return f"USER-{int(time.time() * 1000) % 100000:05d}"


def _generate_token(user: User) -> str:
    return f"mock-jwt-{user.role.lower()}-{user.id}"


def _hash_password(password: str) -> str:
    """Hash password using SHA-256 with a static salt for demo simplicity."""
    salted = f"routepilot_salt_{password}"
    return hashlib.sha256(salted.encode()).hexdigest()


def _verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return _hash_password(password) == password_hash


@router.post("/signup", response_model=ApiResponse)
def signup(payload: SignupPayload, db: Session = Depends(get_db)):
    return ApiResponse(
        success=False,
        error=ApiError(code="UNAUTHORIZED", message="Public registration is disabled for this demo.")
    )

@router.get("/me", response_model=ApiResponse)
def get_me(token: str, db: Session = Depends(get_db)):
    """Get current user profile (using token suffix as ID for mock auth)"""
    # Mock token format: mock-jwt-{role}-{id}
    parts = token.split("-")
    if len(parts) >= 4:
        user_id = "-".join(parts[3:])
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return ApiResponse(success=True, data=UserResponse(
                id=user.id, email=user.email, role=user.role, name=user.name,
                phone=user.phone, companyName=user.company_name, airlineCode=user.airline_code
            ))
    return ApiResponse(success=False, error=ApiError(code="UNAUTHORIZED", message="Invalid token"))

@router.get("/users/{id}", response_model=ApiResponse)
def get_user(id: str, db: Session = Depends(get_db)):
    """Get user profile by ID"""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        return ApiResponse(success=False, error=ApiError(code="NOT_FOUND", message="User not found"))
    return ApiResponse(success=True, data=UserResponse(
        id=user.id, email=user.email, role=user.role, name=user.name,
        phone=user.phone, companyName=user.company_name, airlineCode=user.airline_code
    ))

# Predefined accounts only for the demo
@router.post("/login", response_model=ApiResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    email_lower = payload.email.strip().lower()
    provided_password = (payload.password or "").strip()

    user = db.query(User).filter(User.email == email_lower).first()
    
    if not user:
        return ApiResponse(
            success=False,
            error=ApiError(code="INVALID_CREDENTIALS", message="Invalid email or password.")
        )
        
    if user.password_hash and not _verify_password(provided_password, user.password_hash):
        return ApiResponse(
            success=False,
            error=ApiError(code="INVALID_CREDENTIALS", message="Invalid email or password.")
        )

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        name=user.name,
        phone=user.phone,
        companyName=user.company_name,
        airlineCode=user.airline_code
    )
    
    return ApiResponse(
        success=True,
        data=AuthResponse(
            user=user_response,
            token=_generate_token(user)
        )
    )
