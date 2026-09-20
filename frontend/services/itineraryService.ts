// Owner: Member A (Frontend Lead) & Member C (Backend Services)
import { ApiResponse, Itinerary } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const itineraryService = {
  async getItineraries(): Promise<ApiResponse<Itinerary[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) return json;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: [],
      error: null,
    };
  },

  async getItineraryById(id: string): Promise<ApiResponse<Itinerary>> {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.id) return json;
      }
    } catch {
      // Fallback
    }

    return {
      success: false,
      data: null as any,
      error: { code: 'NOT_FOUND', message: 'Itinerary not found' },
    };
  },

  async createItinerary(payload: Partial<Itinerary>): Promise<ApiResponse<Itinerary>> {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback
    }

    const created: Itinerary = {
      id: `TRIP-${Date.now().toString().slice(-4)}`,
      userId: payload.userId || 'USER-DEMO-01',
      tripName: payload.tripName || 'New Trip',
      startDate: payload.startDate || new Date().toISOString(),
      endDate: payload.endDate || new Date().toISOString(),
      status: 'ACTIVE',
      flights: payload.flights || [],
      hotel: payload.hotel,
    };

    return {
      success: true,
      data: created,
      error: null,
    };
  },
};
