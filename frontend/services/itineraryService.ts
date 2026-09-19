// Owner: Member A (Frontend Lead) & Member C (Backend Services)
import { ApiResponse, Itinerary } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const DEMO_ITINERARIES: Record<string, Itinerary> = {
  'TRIP-001': {
    id: 'TRIP-001',
    userId: 'USER-DEMO-01',
    tripName: 'Business Travel: Mumbai to London',
    startDate: '2026-06-10',
    endDate: '2026-06-13',
    status: 'ACTIVE',
    flights: [
      {
        id: 'FLIGHT-101',
        airline: 'Air India',
        flightNumber: 'AI101',
        origin: 'BOM',
        destination: 'DEL',
        scheduledDeparture: '2026-06-10T08:30:00Z',
        scheduledArrival: '2026-06-10T10:45:00Z',
        estimatedDeparture: '2026-06-10T08:30:00Z',
        estimatedArrival: '2026-06-10T10:45:00Z',
        status: 'CANCELLED',
        terminal: 'Terminal 2',
        gate: 'Gate 42B',
      },
      {
        id: 'FLIGHT-203',
        airline: 'Air India',
        flightNumber: 'AI203',
        origin: 'DEL',
        destination: 'LHR',
        scheduledDeparture: '2026-06-10T13:45:00Z',
        scheduledArrival: '2026-06-10T18:30:00Z',
        status: 'SCHEDULED',
        terminal: 'Terminal 3',
        gate: 'Gate 18',
      },
    ],
    hotel: {
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
    },
  },
};

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
      data: Object.values(DEMO_ITINERARIES),
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

    const fallback = DEMO_ITINERARIES[id] || DEMO_ITINERARIES['TRIP-001'];
    return {
      success: true,
      data: fallback,
      error: null,
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
