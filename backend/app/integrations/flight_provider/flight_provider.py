# Owner: Member D (Backend AI / Agent & Integration)
# Section 31: Mock API Architecture & Provider Interfaces
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class FlightProvider(ABC):
    """Abstract base for flight data providers (GDS/NDC or Mock)."""

    @abstractmethod
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        """Retrieve real-time flight status."""
        pass

    @abstractmethod
    def search_alternatives(
        self, origin: str, destination: str, departure_date: str
    ) -> List[Dict[str, Any]]:
        """Search for alternative flights on the given route and date."""
        pass


class MockFlightProvider(FlightProvider):
    """
    Mock flight provider returning deterministic data for hackathon demo.
    Covers 4 candidate alternatives matching the SRS scenario:
      - ALT-101: Exceeds fare policy (₹35,000 > ₹20,000)
      - ALT-102: Compliant, best option (₹8,500, 1 stop)
      - ALT-103: Exceeds fare policy (₹42,000 > ₹20,000)
      - ALT-104: Compliant, second-best (₹15,000, 0 stops direct)
    """

    # Pre-defined flight status lookup
    FLIGHT_STATUSES = {
        "AI101": {
            "flight_id": "AI101",
            "airline": "Air India",
            "origin": "BOM",
            "destination": "DEL",
            "scheduled_departure": "2026-06-10T14:30:00",
            "scheduled_arrival": "2026-06-10T16:45:00",
            "status": "CANCELLED",
            "status_reason": "Operational cancellation due to crew unavailability",
        },
        "AI203": {
            "flight_id": "AI203",
            "airline": "Air India",
            "origin": "DEL",
            "destination": "LHR",
            "scheduled_departure": "2026-06-10T21:00:00",
            "scheduled_arrival": "2026-06-11T03:30:00",
            "status": "SCHEDULED",
        },
    }

    # Pre-defined candidate alternatives for BOM->DEL route
    ALTERNATIVES = [
        {
            "id": "ALT-101",
            "airline": "Air India",
            "flight_number": "AI105",
            "origin": "BOM",
            "destination": "DEL",
            "departure_time": "18:30",
            "arrival_time": "23:10",
            "additional_fare": 35000,  # Exceeds INR 20k policy
            "stops": 1,
            "connection_minutes": 120,
        },
        {
            "id": "ALT-102",
            "airline": "Air India",
            "flight_number": "AI203",
            "origin": "BOM",
            "destination": "DEL",
            "departure_time": "20:30",
            "arrival_time": "05:45",
            "additional_fare": 8500,  # Compliant — best fare
            "stops": 1,
            "connection_minutes": 150,
        },
        {
            "id": "ALT-103",
            "airline": "SpiceJet",
            "flight_number": "SG422",
            "origin": "BOM",
            "destination": "DEL",
            "departure_time": "16:00",
            "arrival_time": "18:15",
            "additional_fare": 42000,  # Exceeds INR 20k policy
            "stops": 0,
            "connection_minutes": None,
        },
        {
            "id": "ALT-104",
            "airline": "IndiGo",
            "flight_number": "6E204",
            "origin": "BOM",
            "destination": "DEL",
            "departure_time": "19:45",
            "arrival_time": "22:00",
            "additional_fare": 15000,  # Compliant — second-best fare
            "stops": 0,
            "connection_minutes": None,
        },
    ]

    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        """Returns deterministic flight status for demo scenarios."""
        if flight_id in self.FLIGHT_STATUSES:
            return self.FLIGHT_STATUSES[flight_id]

        return {
            "flight_id": flight_id,
            "status": "SCHEDULED",
            "status_reason": "No disruption detected",
        }

    def search_alternatives(
        self, origin: str, destination: str, departure_date: str
    ) -> List[Dict[str, Any]]:
        """Returns the full set of 4 candidate alternatives for demo."""
        return [alt.copy() for alt in self.ALTERNATIVES]


class RealFlightProvider(FlightProvider):
    """
    Placeholder for real GDS/NDC integration (Amadeus, Sabre, etc.).
    Would connect to actual flight data APIs in production.
    """

    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        raise NotImplementedError(
            "Real GDS/NDC integration not implemented. "
            "Use MockFlightProvider for demo."
        )

    def search_alternatives(
        self, origin: str, destination: str, departure_date: str
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError(
            "Real GDS/NDC integration not implemented. "
            "Use MockFlightProvider for demo."
        )
