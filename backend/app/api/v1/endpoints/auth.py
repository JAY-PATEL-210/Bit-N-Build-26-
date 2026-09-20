import time
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

@router.post("/signup", response_model=ApiResponse)
def signup(payload: SignupPayload, db: Session = Depends(get_db)):
    email_lower = payload.email.lower()
    
    # Check if user exists
    existing = db.query(User).filter(User.email == email_lower).first()
    if existing:
        return ApiResponse(
            success=False,
            error=ApiError(code="USER_EXISTS", message="User with this email already exists")
        )
    
    # Create new user
    new_user = User(
        id=_generate_user_id(),
        email=email_lower,
        name=payload.name,
        phone=payload.phone,
        role=payload.role,
        company_name=payload.companyName,
        airline_code=payload.airlineCode
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        name=new_user.name,
        phone=new_user.phone,
        companyName=new_user.company_name,
        airlineCode=new_user.airline_code
    )
    
    return ApiResponse(
        success=True,
        data=AuthResponse(
            user=user_response,
            token=_generate_token(new_user)
        )
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

# Authorized Airline Single-Credential Configuration
AUTHORIZED_AIRLINE_IDENTIFIERS = {"airline@travelsync.com", "ops@airline.com", "airline"}
AUTHORIZED_AIRLINE_PASSWORDS = {"airline123", "airline2026", "admin123"}

@router.post("/login", response_model=ApiResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    email_lower = payload.email.strip().lower()
    provided_password = (payload.password or "").strip()
    role_requested = (payload.role or "TRAVELER").strip().upper()

    # If the user specifically selects COMPANY role, or uses an airline identifier:
    if role_requested == "COMPANY" or email_lower in AUTHORIZED_AIRLINE_IDENTIFIERS:
        # STRICT CHECK: Only ONE particular airline ID and password allowed
        if email_lower not in AUTHORIZED_AIRLINE_IDENTIFIERS or provided_password not in AUTHORIZED_AIRLINE_PASSWORDS:
            return ApiResponse(
                success=False,
                error=ApiError(code="INVALID_CREDENTIALS", message="Access Denied: Invalid Airline Credentials. Only authorized airline partners may log in.")
            )
        
        # Valid airline credentials -> find or create airline user
        user = db.query(User).filter(User.email == email_lower).first()
        if not user:
            user = User(
                id=_generate_user_id(),
                email=email_lower,
                name="Airline Operations Admin",
                role="COMPANY",
                company_name="Air India / TravelSync Partner",
                airline_code="AI"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        # CUSTOMER / TRAVELER: All emails and passwords are valid!
        user = db.query(User).filter(User.email == email_lower).first()
        if not user:
            # Auto-provision customer account in database
            display_name = email_lower.split("@")[0].replace(".", " ").title() if "@" in email_lower else "Traveler"
            user = User(
                id=_generate_user_id(),
                email=email_lower,
                name=display_name,
                role="TRAVELER",
                company_name=None,
                airline_code=None
            )
            db.add(user)
            db.commit()
            db.refresh(user)

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
