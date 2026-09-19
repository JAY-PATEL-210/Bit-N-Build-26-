// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 11, 14, 17, 39: Hotel Service
import { ApiResponse, HotelBooking } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const DEMO_HOTELS: Record<string, HotelBooking[]> = {
  'TRIP-001': [
    {
      id: 'HOTEL-LON-001',
      itineraryId: 'TRIP-001',
      hotelName: 'The Landmark London',
      location: 'Marylebone, London, UK',
      checkIn: '2026-06-10',
      checkOut: '2026-06-13',
      bookingReference: 'HTL-LON-9921',
      status: 'CONFIRMED',
      originalCheckIn: '2026-06-10',
      pricePerNight: 7500,
      currency: 'INR',
      actionTaken: 'NO_ACTION',
    },
  ],
};

export const hotelService = {
  async getHotelsByItinerary(itineraryId: string): Promise<ApiResponse<HotelBooking[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/${itineraryId}/hotels`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) return json;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: DEMO_HOTELS[itineraryId] || DEMO_HOTELS['TRIP-001'],
      error: null,
    };
  },

  async modifyHotel(
    hotelId: string,
    payload: { checkIn: string; checkOut?: string; reason?: string }
  ): Promise<ApiResponse<HotelBooking>> {
    try {
      const res = await fetch(`${API_BASE}/api/hotels/${hotelId}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Fallback
    }

    const updated: HotelBooking = {
      id: hotelId,
      itineraryId: 'TRIP-001',
      hotelName: 'The Landmark London',
      location: 'Marylebone, London, UK',
      checkIn: payload.checkIn,
      checkOut: payload.checkOut || '2026-06-13',
      bookingReference: 'HTL-LON-9921',
      status: 'MODIFIED_AUTOMATICALLY',
      originalCheckIn: '2026-06-10',
      modifiedCheckIn: payload.checkIn,
      pricePerNight: 7500,
      currency: 'INR',
      actionTaken: 'MODIFY_CHECKIN',
    };

    return {
      success: true,
      data: updated,
      error: null,
    };
  },
};
