// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 14, 15: Flight Service with resilient API calls and fallback fixtures
import { ApiResponse, Flight } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const DEMO_FLIGHTS: Record<string, Flight> = {
  'FLIGHT-101': {
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
    departureTime: '08:30',
    arrivalTime: '10:45',
  },
  'FLIGHT-203': {
    id: 'FLIGHT-203',
    airline: 'Air India',
    flightNumber: 'AI203',
    origin: 'DEL',
    destination: 'LHR',
    scheduledDeparture: '2026-06-10T13:45:00Z',
    scheduledArrival: '2026-06-10T18:30:00Z',
    estimatedDeparture: '2026-06-10T20:30:00Z',
    estimatedArrival: '2026-06-11T05:45:00Z',
    status: 'DELAYED',
    terminal: 'Terminal 3',
    gate: 'Gate 18',
    departureTime: '13:45',
    arrivalTime: '18:30',
  },
};

export const flightService = {
  async getFlight(id: string): Promise<ApiResponse<Flight>> {
    try {
      const res = await fetch(`${API_BASE}/api/flights/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Backend offline fallback
    }

    const fallback = DEMO_FLIGHTS[id] || DEMO_FLIGHTS['FLIGHT-101'];
    return {
      success: true,
      data: fallback,
      error: null,
    };
  },

  async getFlightStatus(id: string): Promise<ApiResponse<{ status: string; estimatedDeparture?: string; estimatedArrival?: string }>> {
    try {
      const res = await fetch(`${API_BASE}/api/flights/${id}/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Fallback
    }

    const flight = DEMO_FLIGHTS[id] || DEMO_FLIGHTS['FLIGHT-101'];
    return {
      success: true,
      data: {
        status: flight.status,
        estimatedDeparture: flight.estimatedDeparture,
        estimatedArrival: flight.estimatedArrival,
      },
      error: null,
    };
  },
};
