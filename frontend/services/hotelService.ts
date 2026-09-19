import { ApiResponse, HotelBooking } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const hotelService = {
  async getHotelsByItinerary(itineraryId: string): Promise<ApiResponse<HotelBooking[]>> {
    const res = await fetch(`${API_BASE}/api/itineraries/${itineraryId}/hotels`);
    return res.json();
  },

  async modifyHotel(hotelId: string, payload: { checkIn: string; checkOut?: string; reason?: string }): Promise<ApiResponse<HotelBooking>> {
    const res = await fetch(`${API_BASE}/api/hotels/${hotelId}/modify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
