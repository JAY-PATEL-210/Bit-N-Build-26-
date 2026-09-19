from app.integrations.hotel.base import HotelProviderBase

class MockHotelProvider(HotelProviderBase):
    def modify_reservation(self, hotel_id: str, new_check_in: str, new_check_out: str) -> dict:
        return {
            "success": True,
            "hotel_id": hotel_id,
            "new_check_in": new_check_in,
            "status": "MODIFIED",
        }
