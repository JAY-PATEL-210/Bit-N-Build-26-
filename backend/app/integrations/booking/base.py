from abc import ABC, abstractmethod

class BookingProviderBase(ABC):
    @abstractmethod
    def book_flight(self, flight_id: str, passenger_info: dict, idempotency_key: str) -> dict:
        pass
