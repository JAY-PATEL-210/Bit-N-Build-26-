from abc import ABC, abstractmethod
from typing import Dict, Any


class BookingProviderBase(ABC):
    """Abstract base class for booking providers (GDS or Mock)."""

    @abstractmethod
    def book_flight(
        self, flight_id: str, passenger_info: dict, idempotency_key: str
    ) -> dict:
        """
        Execute a flight booking with idempotency guarantee.

        Args:
            flight_id: The flight/alternative ID to book
            passenger_info: Traveler information
            idempotency_key: Unique key to prevent duplicate bookings (Section 38)

        Returns:
            Booking confirmation dict
        """
        pass

    @abstractmethod
    def cancel_booking(self, booking_reference: str) -> dict:
        """Cancel an existing booking."""
        pass
