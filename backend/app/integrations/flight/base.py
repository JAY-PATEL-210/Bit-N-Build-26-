from abc import ABC, abstractmethod
from typing import Dict, Any, List

class FlightProviderBase(ABC):
    @abstractmethod
    def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def search_alternatives(self, origin: str, destination: str, date: str) -> List[Dict[str, Any]]:
        pass
