from app.integrations.booking.base import BookingProviderBase

class MockBookingProvider(BookingProviderBase):
    def book_flight(self, flight_id: str, passenger_info: dict, idempotency_key: str) -> dict:
        return {
            "success": True,
            "booking_reference": f"MOCK-{idempotency_key[-6:]}",
            "flight_id": flight_id,
        }
