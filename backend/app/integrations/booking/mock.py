from app.integrations.booking.base import BookingProviderBase
from datetime import datetime
import logging

logger = logging.getLogger("AutonomousTravelConcierge.MockBooking")


class MockBookingProvider(BookingProviderBase):
    """
    Mock booking provider with full idempotency tracking.
    Guarantees zero duplicate bookings (Section 38, NFR-05).
    Supports simulated booking failures for error-handling demos.
    """

    def __init__(self):
        # Track processed idempotency keys -> booking results
        self._processed_bookings = {}
        # Set of flight IDs that should simulate failure
        self._failure_flights = set()

    def set_failure_mode(self, flight_id: str):
        """Configure a flight ID to simulate booking failure."""
        self._failure_flights.add(flight_id)

    def clear_failure_mode(self, flight_id: str):
        """Remove failure simulation for a flight ID."""
        self._failure_flights.discard(flight_id)

    def book_flight(
        self, flight_id: str, passenger_info: dict, idempotency_key: str
    ) -> dict:
        """
        Execute a mock flight booking with idempotency guarantee.

        - If idempotency_key was already processed, return the original result
        - If flight_id is in failure mode, simulate a transient failure
        - Otherwise, return a successful mock booking confirmation
        """
        # Idempotency check — return existing result if already processed
        if idempotency_key in self._processed_bookings:
            existing = self._processed_bookings[idempotency_key]
            logger.info(
                "[IDEMPOTENT] Duplicate booking request ignored. "
                "Returning existing booking: %s",
                existing.get("booking_reference"),
            )
            return {
                **existing,
                "idempotent_return": True,
                "message": "Duplicate request detected; returning existing booking record.",
            }

        # Simulated failure for error-handling demo (Scenario 5)
        if flight_id in self._failure_flights:
            logger.warning(
                "[MOCK BOOKING FAILURE] Simulated failure for flight %s", flight_id
            )
            result = {
                "success": False,
                "flight_id": flight_id,
                "idempotency_key": idempotency_key,
                "error": "SEATS_UNAVAILABLE_DURING_CONFIRMATION",
                "message": "Booking failed: seats became unavailable during confirmation.",
                "timestamp": datetime.utcnow().isoformat(),
            }
            # Don't store failed bookings — allow retry
            return result

        # Successful booking
        booking_ref = f"CONF-{idempotency_key[-6:]}"
        result = {
            "success": True,
            "booking_reference": booking_ref,
            "flight_id": flight_id,
            "passenger": passenger_info.get("name", "Traveler"),
            "idempotency_key": idempotency_key,
            "status": "CONFIRMED",
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Store for idempotency
        self._processed_bookings[idempotency_key] = result

        logger.info(
            "[MOCK BOOKING] Confirmed: ref=%s, flight=%s, passenger=%s",
            booking_ref, flight_id, passenger_info.get("name"),
        )

        return result

    def cancel_booking(self, booking_reference: str) -> dict:
        """Cancel a mock booking."""
        logger.info("[MOCK BOOKING] Cancelled: ref=%s", booking_reference)
        return {
            "success": True,
            "booking_reference": booking_reference,
            "status": "CANCELLED",
            "timestamp": datetime.utcnow().isoformat(),
        }
