import { ApiResponse, Itinerary } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const itineraryService = {
  async getItineraries(): Promise<ApiResponse<Itinerary[]>> {
    const res = await fetch(`${API_BASE}/api/itineraries`);
    return res.json();
  },

  async getItineraryById(id: string): Promise<ApiResponse<Itinerary>> {
    const res = await fetch(`${API_BASE}/api/itineraries/${id}`);
    return res.json();
  },

  async createItinerary(payload: Partial<Itinerary>): Promise<ApiResponse<Itinerary>> {
    const res = await fetch(`${API_BASE}/api/itineraries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
