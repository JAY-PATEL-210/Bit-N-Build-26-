// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 14, 15, 17, 33, 52: Disruption Service with Real API & Appendix B Fallback
import { ApiResponse, Disruption, AlternativeFlight } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Fallback demo fixtures adhering to Appendix B (Mumbai -> Delhi -> London)
const DEMO_DISRUPTIONS: Record<string, Disruption> = {
  'DISRUPT-001': {
    id: 'DISRUPT-001',
    itineraryId: 'TRIP-001',
    segmentId: 'SEG-001',
    type: 'CANCELLATION',
    severity: 'CRITICAL',
    description: 'Flight AI101 (Mumbai BOM → Delhi DEL) has been CANCELLED due to technical issues.',
    detectedAt: '2026-09-19T08:00:00Z',
    impact: 'Cascading disruption: Connecting flight AI203 (Delhi DEL → London LHR) is missed. Hotel check-in in London requires adjustment.',
    status: 'DECISION_READY',
    affectedFlightNumber: 'AI101',
    affectedSegments: ['SEG-001', 'SEG-002'],
    affectedHotelId: 'HOTEL-LON-001',
    recommendedAlternativeId: 'ALT-102',
    requiresApproval: false,
  },
  'DISRUPT-002': {
    id: 'DISRUPT-002',
    itineraryId: 'TRIP-001',
    segmentId: 'SEG-001',
    type: 'DELAY',
    severity: 'HIGH',
    description: 'Flight AI101 (Mumbai BOM → Delhi DEL) delayed by 180 minutes.',
    detectedAt: '2026-09-19T08:00:00Z',
    impact: 'Connection buffer reduced to 15 minutes (< 90 min minimum requirement). Connection classified as infeasible.',
    status: 'SEARCHING_ALTERNATIVES',
    affectedFlightNumber: 'AI101',
    affectedSegments: ['SEG-001', 'SEG-002'],
    affectedHotelId: 'HOTEL-LON-001',
    recommendedAlternativeId: 'ALT-102',
    requiresApproval: false,
  },
};

const DEMO_ALTERNATIVES: AlternativeFlight[] = [
  {
    id: 'ALT-102',
    airline: 'Air India',
    flightNumber: 'AI203',
    origin: 'DEL',
    destination: 'LHR',
    departureTime: '20:30',
    arrivalTime: '05:45 +1d',
    duration: '9h 45m',
    stops: 1,
    additionalFare: 8500,
    currency: 'INR',
    policyCompliant: true,
    confidence: 0.95,
    recommended: true,
    requiresApproval: false,
    cabin: 'ECONOMY',
    connectionBufferMinutes: 135,
    availableSeats: 4,
    reasonCodes: [
      'WITHIN_FARE_LIMIT',
      'EARLIEST_ELIGIBLE_ARRIVAL',
      'VALID_CONNECTION',
      'PREFERRED_CABIN',
    ],
    explanation:
      'Selected because it provides the earliest policy-compliant arrival while remaining within the ₹20,000 autonomous rebooking limit and maintaining a 2h 15m connection buffer.',
  },
  {
    id: 'ALT-103',
    airline: 'British Airways',
    flightNumber: 'BA138',
    origin: 'BOM',
    destination: 'LHR',
    departureTime: '23:15',
    arrivalTime: '07:30 +1d',
    duration: '9h 15m',
    stops: 0,
    additionalFare: 14200,
    currency: 'INR',
    policyCompliant: true,
    confidence: 0.88,
    recommended: false,
    requiresApproval: false,
    cabin: 'ECONOMY',
    connectionBufferMinutes: 0,
    availableSeats: 2,
    reasonCodes: ['WITHIN_FARE_LIMIT', 'DIRECT_FLIGHT'],
    explanation: 'Direct non-stop flight to London within corporate policy limit, but arrives 1h 45m later than AI203.',
  },
  {
    id: 'ALT-104',
    airline: 'Emirates',
    flightNumber: 'EK501',
    origin: 'BOM',
    destination: 'LHR',
    departureTime: '19:40',
    arrivalTime: '06:15 +1d',
    duration: '11h 05m',
    stops: 1,
    additionalFare: 24500,
    currency: 'INR',
    policyCompliant: false,
    confidence: 0.62,
    recommended: false,
    requiresApproval: true,
    cabin: 'BUSINESS',
    connectionBufferMinutes: 110,
    availableSeats: 6,
    reasonCodes: ['EXCEEDS_FARE_LIMIT', 'CABIN_MISMATCH'],
    explanation:
      'Exceeds ₹20,000 maximum additional fare limit by ₹4,500 and requires Business cabin exception. Autonomous rebooking blocked; human approval required.',
  },
  {
    id: 'ALT-105',
    airline: 'Lufthansa',
    flightNumber: 'LH761',
    origin: 'DEL',
    destination: 'LHR',
    departureTime: '01:50 +1d',
    arrivalTime: '11:20 +1d',
    duration: '14h 00m',
    stops: 1,
    additionalFare: 29000,
    currency: 'INR',
    policyCompliant: false,
    confidence: 0.45,
    recommended: false,
    requiresApproval: true,
    cabin: 'ECONOMY',
    connectionBufferMinutes: 240,
    availableSeats: 1,
    reasonCodes: ['EXCEEDS_FARE_LIMIT', 'EXCESSIVE_DELAY'],
    explanation: 'Violates max arrival delay limit of 8 hours and exceeds fare budget. Requires explicit traveler override.',
  },
];

export const disruptionService = {
  async getDisruptions(): Promise<ApiResponse<Disruption[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/disruptions`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) return json;
      }
    } catch {
      // Backend offline fallback
    }
    return {
      success: true,
      data: Object.values(DEMO_DISRUPTIONS),
      error: null,
    };
  },

  async getDisruptionById(id: string): Promise<ApiResponse<Disruption>> {
    try {
      const res = await fetch(`${API_BASE}/api/disruptions/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.description) return json;
      }
    } catch {
      // Fallback
    }
    const fallback = DEMO_DISRUPTIONS[id] || DEMO_DISRUPTIONS['DISRUPT-001'];
    return {
      success: true,
      data: fallback,
      error: null,
    };
  },

  async getAlternatives(disruptionId: string): Promise<ApiResponse<AlternativeFlight[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/disruptions/${disruptionId}/alternatives`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) return json;
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: DEMO_ALTERNATIVES,
      error: null,
    };
  },

  async simulateDisruption(payload: {
    eventType: string;
    flightId?: string;
    itineraryId?: string;
  }): Promise<ApiResponse<Disruption>> {
    try {
      const res = await fetch(`${API_BASE}/api/disruptions/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Merge with detailed disruption fixture
          const mapped = {
            ...DEMO_DISRUPTIONS['DISRUPT-001'],
            id: json.data.id || 'DISRUPT-001',
            type: (payload.eventType.includes('CANCEL') ? 'CANCELLATION' : payload.eventType) as any,
          };
          return { success: true, data: mapped, error: null };
        }
      }
    } catch {
      // Fallback
    }

    const typeKey = payload.eventType.includes('DELAY') ? 'DISRUPT-002' : 'DISRUPT-001';
    return {
      success: true,
      data: DEMO_DISRUPTIONS[typeKey],
      error: null,
    };
  },
};
