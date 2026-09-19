from abc import ABC, abstractmethod
from typing import Dict, Any, List


class FlightProviderBase(ABC):
    """Abstract base class for flight data providers."""

    @abstractmethod
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        """Get real-time status for a given flight."""
        pass

    @abstractmethod
    def search_alternatives(
        self, origin: str, destination: str, date: str
    ) -> List[Dict[str, Any]]:
        """Search for alternative flights on a route."""
        pass
