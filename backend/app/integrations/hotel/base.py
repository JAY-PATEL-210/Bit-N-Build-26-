from abc import ABC, abstractmethod

class HotelProviderBase(ABC):
    @abstractmethod
    def modify_reservation(self, hotel_id: str, new_check_in: str, new_check_out: str) -> dict:
        pass
