import logging
from typing import Dict, Any, List
from duffel_api import Duffel

from app.integrations.flight.base import FlightProviderBase
from app.core.config import settings

logger = logging.getLogger("AutonomousTravelConcierge.DuffelFlight")


class DuffelFlightProvider(FlightProviderBase):
    """
    Real flight provider using Duffel API.
    """

    def __init__(self):
        if not settings.FLIGHT_API_KEY:
            raise ValueError("FLIGHT_API_KEY is required for DuffelFlightProvider")
        self.duffel = Duffel(access_token=settings.FLIGHT_API_KEY, api_version="v2")

    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        """
        Duffel doesn't have a direct 'flight status' API, so we mock this part
        or return a default for demo purposes.
        """
        return {
            "flight_id": flight_id,
            "status": "SCHEDULED",  # Defaulting to scheduled unless simulated otherwise
            "airline": "Unknown",
            "origin": "Unknown",
            "destination": "Unknown",
        }

    def search_alternatives(
        self, origin: str, destination: str, date: str
    ) -> List[Dict[str, Any]]:
        """
        Search for real flights on Duffel.
        `date` format should be YYYY-MM-DD.
        """
        logger.info(f"Searching Duffel for flights from {origin} to {destination} on {date}")
        try:
            offer_request_response = (
                self.duffel.offer_requests.create()
                .slices(
                    [
                        {
                            "origin": origin,
                            "destination": destination,
                            "departure_date": date,
                        }
                    ]
                )
                .passengers([{"type": "adult"}])
                .cabin_class("economy")
                .return_offers()
                .execute()
            )
            
            alternatives = []
            for offer in offer_request_response.offers[:5]:  # Limit to top 5
                # Simple parsing of Duffel offer
                slice_0 = offer.slices[0]
                segment_0 = slice_0.segments[0]
                
                alternatives.append({
                    "id": offer.id,
                    "airline": segment_0.operating_carrier.name,
                    "flight_number": segment_0.operating_carrier_flight_number,
                    "additional_fare": float(offer.total_amount),
                    "stops": len(slice_0.segments) - 1,
                    "currency": offer.total_currency,
                })
            
            return alternatives

        except Exception as e:
            logger.error(f"Duffel API error: {str(e)}")
            return []
