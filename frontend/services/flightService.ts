// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 14, 15: Flight Service with Company operations (Cancel, Delay, Create) and resilient fallback
import {
  ApiResponse,
  CancelFlightPayload,
  CreateFlightPayload,
  DelayFlightPayload,
  Flight,
} from '../types';
import { notificationService } from './notificationService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const FLIGHTS_STORE_KEY = 'concierge_flights_store';

const INITIAL_DEMO_FLIGHTS: Flight[] = [
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
    status: 'SCHEDULED',
    terminal: 'Terminal 2',
    gate: 'Gate 42B',
    departureTime: '08:30',
    arrivalTime: '10:45',
  },
  {
    id: 'FLIGHT-203',
    airline: 'Air India',
    flightNumber: 'AI203',
    origin: 'DEL',
    destination: 'LHR',
    scheduledDeparture: '2026-06-10T13:45:00Z',
    scheduledArrival: '2026-06-10T18:30:00Z',
    estimatedDeparture: '2026-06-10T13:45:00Z',
    estimatedArrival: '2026-06-10T18:30:00Z',
    status: 'SCHEDULED',
    terminal: 'Terminal 3',
    gate: 'Gate 18',
    departureTime: '13:45',
    arrivalTime: '18:30',
  },
  {
    id: 'FLIGHT-305',
    airline: 'British Airways',
    flightNumber: 'BA305',
    origin: 'LHR',
    destination: 'JFK',
    scheduledDeparture: '2026-06-11T11:00:00Z',
    scheduledArrival: '2026-06-11T14:15:00Z',
    estimatedDeparture: '2026-06-11T11:00:00Z',
    estimatedArrival: '2026-06-11T14:15:00Z',
    status: 'SCHEDULED',
    terminal: 'Terminal 5',
    gate: 'Gate B32',
    departureTime: '11:00',
    arrivalTime: '14:15',
  },
];

function getStoredFlights(): Flight[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_FLIGHTS;
  try {
    const raw = localStorage.getItem(FLIGHTS_STORE_KEY);
    if (!raw) {
      localStorage.setItem(FLIGHTS_STORE_KEY, JSON.stringify(INITIAL_DEMO_FLIGHTS));
      return INITIAL_DEMO_FLIGHTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_FLIGHTS;
  }
}

function saveFlights(flights: Flight[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLIGHTS_STORE_KEY, JSON.stringify(flights));
  } catch {
    // storage error
  }
}

export const flightService = {
  /**
   * Get list of all flights
   * Proposed API: GET /api/flights
   */
  async getFlights(): Promise<ApiResponse<Flight[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/flights`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Fallback
    }

    const flights = getStoredFlights();
    return {
      success: true,
      data: flights,
      error: null,
    };
  },

  /**
   * Get single flight by ID
   * Existing API: GET /api/flights/{id}
   */
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

    const flights = getStoredFlights();
    const flight = flights.find((f) => f.id === id) || flights[0];
    return {
      success: true,
      data: flight,
      error: null,
    };
  },

  /**
   * Get live status of single flight
   * Existing API: GET /api/flights/{id}/status
   */
  async getFlightStatus(
    id: string
  ): Promise<ApiResponse<{ status: string; estimatedDeparture?: string; estimatedArrival?: string }>> {
    try {
      const res = await fetch(`${API_BASE}/api/flights/${id}/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Fallback
    }

    const flights = getStoredFlights();
    const flight = flights.find((f) => f.id === id) || flights[0];
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

  /**
   * Add a new flight (Company action)
   * Proposed API: POST /api/flights
   */
  async createFlight(payload: CreateFlightPayload): Promise<ApiResponse<Flight>> {
    try {
      const res = await fetch(`${API_BASE}/api/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Proposed endpoint fallback
    }

    const newFlight: Flight = {
      id: `FLIGHT-${Date.now().toString().slice(-4)}`,
      airline: payload.airline,
      flightNumber: payload.flightNumber.toUpperCase(),
      origin: payload.origin.toUpperCase(),
      destination: payload.destination.toUpperCase(),
      scheduledDeparture: payload.scheduledDeparture,
      scheduledArrival: payload.scheduledArrival,
      estimatedDeparture: payload.scheduledDeparture,
      estimatedArrival: payload.scheduledArrival,
      status: 'SCHEDULED',
      terminal: payload.terminal || 'Terminal 1',
      gate: payload.gate || 'Gate TBD',
      departureTime: payload.scheduledDeparture.slice(11, 16) || '10:00',
      arrivalTime: payload.scheduledArrival.slice(11, 16) || '14:00',
    };

    const current = getStoredFlights();
    const updated = [newFlight, ...current];
    saveFlights(updated);

    return {
      success: true,
      data: newFlight,
      error: null,
    };
  },

  /**
   * Cancel flight with mandatory company reason
   * Proposed API: POST /api/flights/{id}/cancel
   */
  async cancelFlight(id: string, payload: CancelFlightPayload): Promise<ApiResponse<Flight>> {
    if (!payload.reason || !payload.reason.trim()) {
      return {
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Cancellation reason is required.' },
      };
    }

    try {
      const res = await fetch(`${API_BASE}/api/flights/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Sync notification with company reason
          await notificationService.addNotification({
            title: `Flight ${json.data.flightNumber} Cancelled by Airline`,
            message: `Airline announced cancellation for ${json.data.flightNumber} (${json.data.origin} → ${json.data.destination}).`,
            type: 'CRITICAL_DISRUPTION',
            reason: payload.reason,
            whatHappened: `Flight ${json.data.flightNumber} status changed to CANCELLED. Airline stated reason: "${payload.reason}"`,
            whatSystemDid: 'Autonomous Concierge detected cancellation, analyzed downstream connections, and queried alternatives.',
            currentStatus: 'DISRUPTION_CONFIRMED',
            whatUserMustDo: 'Review replacement routes in your concierge timeline.',
          });
          return json;
        }
      }
    } catch {
      // Fallback
    }

    const current = getStoredFlights();
    const flightIndex = current.findIndex((f) => f.id === id);
    if (flightIndex === -1) {
      return {
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: `Flight ${id} not found.` },
      };
    }

    const targetFlight = current[flightIndex];
    const updatedFlight: Flight = {
      ...targetFlight,
      status: 'CANCELLED',
    };
    const updated = [...current];
    updated[flightIndex] = updatedFlight;

    saveFlights(updated);

    // Create traveler notification carrying the exact company cancellation reason
    await notificationService.addNotification({
      title: `Flight ${updatedFlight.flightNumber} Cancelled by Airline`,
      message: `Airline announced cancellation for ${updatedFlight.flightNumber} (${updatedFlight.origin} → ${updatedFlight.destination}).`,
      type: 'CRITICAL_DISRUPTION',
      reason: payload.reason,
      whatHappened: `Flight ${updatedFlight.flightNumber} (${updatedFlight.origin} → ${updatedFlight.destination}) status changed to CANCELLED.`,
      whatSystemDid: 'Analyzed downstream itinerary, detected connection risk, and searched eligible replacement routes.',
      currentStatus: 'Flight CANCELLED by Airline Operations',
      whatUserMustDo: 'Review replacement alternatives on your traveler dashboard.',
      itineraryId: 'TRIP-001',
      disruptionId: `DISRUPT-${Date.now().toString().slice(-4)}`,
    });

    return {
      success: true,
      data: updatedFlight,
      error: null,
    };
  },

  /**
   * Delay flight with mandatory company reason and new timings
   * Proposed API: POST /api/flights/{id}/delay
   */
  async delayFlight(id: string, payload: DelayFlightPayload): Promise<ApiResponse<Flight>> {
    if (!payload.reason || !payload.reason.trim()) {
      return {
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Delay reason is required.' },
      };
    }

    try {
      const res = await fetch(`${API_BASE}/api/flights/${id}/delay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          await notificationService.addNotification({
            title: `Flight ${json.data.flightNumber} Delayed by Airline`,
            message: `Flight ${json.data.flightNumber} delayed. New departure: ${payload.newDepartureTime}.`,
            type: 'WARNING',
            reason: payload.reason,
            whatHappened: `Flight ${json.data.flightNumber} status changed to DELAYED. Airline stated reason: "${payload.reason}"`,
            whatSystemDid: 'Re-evaluated connection buffer and transit timelines.',
            currentStatus: 'DELAYED',
            whatUserMustDo: 'Monitor departure gate for schedule updates.',
          });
          return json;
        }
      }
    } catch {
      // Fallback
    }

    const current = getStoredFlights();
    const flightIndex = current.findIndex((f) => f.id === id);
    if (flightIndex === -1) {
      return {
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: `Flight ${id} not found.` },
      };
    }

    const targetFlight = current[flightIndex];
    const updatedFlight: Flight = {
      ...targetFlight,
      status: 'DELAYED',
      estimatedDeparture: payload.newDepartureTime,
      estimatedArrival: payload.newArrivalTime,
      departureTime: payload.newDepartureTime.slice(11, 16) || targetFlight.departureTime,
      arrivalTime: payload.newArrivalTime.slice(11, 16) || targetFlight.arrivalTime,
    };
    const updated = [...current];
    updated[flightIndex] = updatedFlight;

    saveFlights(updated);

    // Create traveler notification carrying the exact company delay reason
    await notificationService.addNotification({
      title: `Flight ${updatedFlight.flightNumber} Schedule Delayed`,
      message: `Flight ${updatedFlight.flightNumber} delayed. Estimated departure: ${payload.newDepartureTime}.`,
      type: 'WARNING',
      reason: payload.reason,
      whatHappened: `Flight ${updatedFlight.flightNumber} status changed to DELAYED.`,
      whatSystemDid: 'Re-calculated minimum connection time for downstream transfer.',
      currentStatus: `DELAYED (New Dep: ${payload.newDepartureTime.slice(11, 16) || 'TBD'})`,
      whatUserMustDo: 'Ensure arrival at terminal 2 hours prior to updated schedule.',
      itineraryId: 'TRIP-001',
      disruptionId: `DISRUPT-${Date.now().toString().slice(-4)}`,
    });

    return {
      success: true,
      data: updatedFlight,
      error: null,
    };
  },
};
