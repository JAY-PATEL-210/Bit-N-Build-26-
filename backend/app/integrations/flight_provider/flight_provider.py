# Owner: Member D (Backend AI / Agent & Integration)
# Section 31: Mock API Architecture & Provider Interfaces
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class FlightProvider(ABC):
    @abstractmethod
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def search_alternatives(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        pass

class MockFlightProvider(FlightProvider):
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        return {
            "flight_id": flight_id,
            "status": "CANCELLED" if flight_id == "AI101" else "SCHEDULED"
        }

    def search_alternatives(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        # Returns candidate alternatives for the demo scenario
        return [
            {
                "id": "ALT-101",
                "airline": "Air India",
                "flight_number": "AI105",
                "departure_time": "18:30",
                "arrival_time": "23:10",
                "additional_fare": 35000, # Exceeds INR 20k policy
                "stops": 1,
            },
            {
                "id": "ALT-102",
                "airline": "Air India",
                "flight_number": "AI203",
                "departure_time": "20:30",
                "arrival_time": "05:45",
                "additional_fare": 8500, # Compliant
                "stops": 1,
            }
        ]

class RealFlightProvider(FlightProvider):
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        raise NotImplementedError("Real GDS / NDC integration")

    def search_alternatives(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        raise NotImplementedError("Real GDS / NDC integration")
