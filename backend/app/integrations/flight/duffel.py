import logging
from typing import Dict, Any, List
from duffel_api import Duffel

from app.integrations.flight.base import FlightProviderBase
from app.core.config import settings

logger = logging.getLogger("AutonomousTravelConcierge.DuffelFlight")


# Monkeypatch duffel_api bug where missing 'allowed_passenger_identity_document_types' causes KeyError
try:
    from duffel_api.models.offer import Offer
    _orig_offer_from_json = Offer.from_json

    @classmethod
    def _safe_offer_from_json(cls, json_data: dict):
        if isinstance(json_data, dict) and "allowed_passenger_identity_document_types" not in json_data:
            json_data = dict(json_data)
            json_data["allowed_passenger_identity_document_types"] = []
        return _orig_offer_from_json(json_data)

    Offer.from_json = _safe_offer_from_json
except Exception:
    pass


class DuffelFlightProvider(FlightProviderBase):
    """
    Real flight provider using Duffel API.
    """

    def __init__(self):
        token = settings.FLIGHT_API_KEY or getattr(settings, "DUFFEL_API_KEY", None)
        if not token:
            raise ValueError("FLIGHT_API_KEY or DUFFEL_API_KEY is required for DuffelFlightProvider")
        self.duffel = Duffel(access_token=token, api_version="v2")

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
        # Ensure date is strictly YYYY-MM-DD if ISO string is passed
        search_date = date.split("T")[0] if "T" in str(date) else str(date)[:10]
        logger.info(f"Searching Duffel for flights from {origin} to {destination} on {search_date}")
        try:
            offer_request_response = (
                self.duffel.offer_requests.create()
                .slices(
                    [
                        {
                            "origin": origin,
                            "destination": destination,
                            "departure_date": search_date,
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
                slice_0 = offer.slices[0] if offer.slices else None
                if not slice_0 or not slice_0.segments:
                    continue
                segment_0 = slice_0.segments[0]
                segment_last = slice_0.segments[-1]
                
                airline_name = (
                    segment_0.operating_carrier.name
                    if segment_0.operating_carrier
                    else (offer.owner.name if offer.owner else "Unknown")
                )
                flight_num = (
                    segment_0.operating_carrier_flight_number
                    or (f"{airline_name[:2].upper()}{offer.id[-3:]}" if airline_name else offer.id)
                )

                alternatives.append({
                    "id": offer.id,
                    "flight_id": flight_num,
                    "airline": airline_name,
                    "flight_number": flight_num,
                    "origin": origin,
                    "destination": destination,
                    "departure_time": segment_0.departing_at,
                    "arrival_time": segment_last.arriving_at,
                    "additional_fare": float(offer.total_amount),
                    "stops": len(slice_0.segments) - 1,
                    "currency": offer.total_currency,
                })
            
            return alternatives

        except Exception as e:
            logger.error(f"Duffel API error: {str(e)}")
            return []

