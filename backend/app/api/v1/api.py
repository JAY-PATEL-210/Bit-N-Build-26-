# Owner: Member C (Backend Lead / Core Services)
from fastapi import APIRouter
from app.api.v1.endpoints import (
    itineraries,
    flights,
    disruptions,
    rebooking,
    hotels,
    notifications,
    audit,
    auth,
    ai_analysis,
    alternatives,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(itineraries.router, prefix="/itineraries", tags=["Itineraries"])
api_router.include_router(flights.router, prefix="/flights", tags=["Flights"])
api_router.include_router(disruptions.router, prefix="/disruptions", tags=["Disruptions"])
api_router.include_router(rebooking.router, prefix="/rebooking", tags=["Rebooking"])
api_router.include_router(hotels.router, tags=["Hotels"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(audit.router, tags=["Audit"])
api_router.include_router(ai_analysis.router, prefix="/ai", tags=["AI Analysis"])
api_router.include_router(alternatives.router, prefix="/alternatives", tags=["Alternatives"])
