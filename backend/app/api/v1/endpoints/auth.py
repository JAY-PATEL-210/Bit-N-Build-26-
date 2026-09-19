import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.itinerary import User
from app.schemas.auth import SignupPayload, LoginPayload, AuthResponse, ApiResponse, UserResponse

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
            error="User with this email already exists"
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

@router.post("/login", response_model=ApiResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    email_lower = payload.email.lower()
    
    user = db.query(User).filter(User.email == email_lower).first()
    
    if not user:
        # Fallback: Auto-provision user based on email (Demo convenience)
        is_company = any(k in email_lower for k in ['company', 'airline', 'airindia', 'ops', 'admin'])
        
        user = User(
            id=_generate_user_id(),
            email=email_lower,
            name="Airline Operations Admin" if is_company else "Demo Traveler",
            role="COMPANY" if is_company else "TRAVELER",
            company_name="Air India Flight Ops" if is_company else None,
            airline_code="AI" if is_company else None
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
