from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class HotelProviderBase(ABC):
    """Abstract base class for hotel reservation providers."""

    @abstractmethod
    def modify_reservation(
        self, hotel_id: str, new_check_in: str, new_check_out: str
    ) -> dict:
        """Modify hotel reservation dates (check-in / check-out)."""
        pass

    @abstractmethod
    def cancel_reservation(self, hotel_id: str) -> dict:
        """Cancel a hotel reservation."""
        pass

    @abstractmethod
    def get_reservation(self, hotel_id: str) -> dict:
        """Get current reservation details."""
        pass
