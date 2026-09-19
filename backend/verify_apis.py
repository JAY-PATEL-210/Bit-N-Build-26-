import asyncio
import logging
import sys

from app.core.config import settings
from app.agents.orchestrator.travel_orchestrator import TravelAgentOrchestrator

logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
logger = logging.getLogger("VerifyAPIs")

async def test_full_pipeline():
    # Reload settings to ensure we have the latest .env values
    logger.info(f"AI_API_KEY Configured: {'Yes' if settings.AI_API_KEY else 'No'}")
    logger.info(f"FLIGHT_API_KEY Configured: {'Yes' if settings.FLIGHT_API_KEY else 'No'}")
    logger.info(f"HOTEL_API_KEY Configured: {'Yes' if settings.HOTEL_API_KEY else 'No'}")
    logger.info(f"BOOKING_API_KEY Configured: {'Yes' if settings.BOOKING_API_KEY else 'No'}")

    orchestrator = TravelAgentOrchestrator(
        ai_api_key=settings.AI_API_KEY,
        ai_model=settings.AI_MODEL,
        ai_base_url=settings.AI_BASE_URL
    )
    
    # 1. Provide a mock disruption event (Flight Cancellation)
    disruption = {
        "event_id": "EVT-TEST-001",
        "event_type": "FLIGHT_CANCELLED",
        "flight_id": "AI101",
        "affected_passengers": ["P1"]
    }
    
    # 2. Mock itinerary data
    itinerary = {
        "booking_reference": "XYZ123",
        "passengers": [{"id": "P1", "name": "John Doe", "email": "john@example.com"}],
        "flights": [
            {"id": "AI101", "origin": "BOM", "destination": "DEL", "date": "2026-10-15"}
        ],
        "hotels": [
            {"id": "HTL1", "city": "DEL", "check_in": "2026-10-15", "check_out": "2026-10-20"}
        ],
        "traveler": {
            "preferences": {"seat_preference": "window", "meal": "veg"}
        }
    }
    
    # 3. Policy allowing rebooking up to 20k
    policy = {
        "maximumAdditionalFare": 20000,
        "maximumStops": 1,
        "autonomousRebooking": True
    }
    
    logger.info("Starting Disruption Pipeline simulation...")
    result = await orchestrator.run_disruption_pipeline(disruption, itinerary, policy)
    
    logger.info("\n--- Pipeline Execution Result ---")
    logger.info(f"Status: {result.get('status')}")
    logger.info(f"Error (if any): {result.get('error')}")
    
    if 'audit_trail' in result:
        logger.info(f"Audit Trail Steps: {list(result['audit_trail'].keys())}")
        
    logger.info("Verification complete.")

if __name__ == "__main__":
    try:
        asyncio.run(test_full_pipeline())
    except Exception as e:
        logger.error(f"Failed to execute pipeline: {e}")
        sys.exit(1)
