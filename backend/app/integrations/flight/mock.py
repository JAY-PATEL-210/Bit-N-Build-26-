from typing import Dict, Any, List
from app.integrations.flight.base import FlightProviderBase

class MockFlightProvider(FlightProviderBase):
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        return {
            "flight_id": flight_id,
            "status": "CANCELLED" if flight_id == "AI101" else "SCHEDULED",
        }

    def search_alternatives(self, origin: str, destination: str, date: str) -> List[Dict[str, Any]]:
        return [
            {"id": "ALT-101", "airline": "Air India", "flight_number": "AI105", "additional_fare": 35000, "stops": 1},
            {"id": "ALT-102", "airline": "Air India", "flight_number": "AI203", "additional_fare": 8500, "stops": 1}
        ]
