// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 10.3, 14, 17, 41, 42: Audit Service
import { ApiResponse, AuditLogEntry } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

let AUDIT_STORE: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    event: 'DISRUPTION_DETECTED',
    actor: 'SYSTEM',
    itineraryId: 'TRIP-001',
    action: 'FLIGHT_STATUS_UPDATE',
    decision: 'CLASSIFY_DISRUPTION',
    reason: 'Flight AI101 received CANCELLED broadcast from airline provider API.',
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:00:00Z',
    metadata: {
      flightNumber: 'AI101',
      route: 'BOM -> DEL',
      scheduledDeparture: '2026-09-19T08:30:00Z',
    },
  },
  {
    id: 'AUD-002',
    event: 'GRAPH_IMPACT_ANALYSIS',
    actor: 'SYSTEM',
    itineraryId: 'TRIP-001',
    action: 'EVALUATE_DOWNSTREAM_EFFECTS',
    decision: 'MARK_AFFECTED_SEGMENTS',
    reason: 'Connection AI203 (DEL -> LHR) is infeasible because incoming feeder flight AI101 is cancelled.',
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:01:10Z',
    metadata: {
      affectedFlights: ['AI101', 'AI203'],
      affectedHotel: 'HOTEL-LON-001',
    },
  },
  {
    id: 'AUD-003',
    event: 'AI_REASONING_EVALUATION',
    actor: 'AI_AGENT',
    itineraryId: 'TRIP-001',
    decisionId: 'DEC-009',
    action: 'EVALUATE_ALTERNATIVES',
    decision: 'REBOOK_ALTERNATIVE',
    reason: 'Selected AI203 because it provides the earliest policy-compliant arrival while remaining within the ₹20,000 autonomous rebooking limit and maintaining a 2h 15m connection buffer.',
    reasonCodes: ['WITHIN_FARE_LIMIT', 'EARLIEST_ELIGIBLE_ARRIVAL', 'VALID_CONNECTION', 'PREFERRED_CABIN'],
    confidence: 0.95,
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:04:30Z',
    metadata: {
      aiModel: 'gemini-1.5-pro',
      selectedOption: 'ALT-102',
      additionalFare: 8500,
      policyLimit: 20000,
      requiresApproval: false,
    },
  },
  {
    id: 'AUD-004',
    event: 'DETERMINISTIC_VALIDATION',
    actor: 'SYSTEM',
    itineraryId: 'TRIP-001',
    action: 'VALIDATE_AI_DECISION',
    decision: 'ALLOW_AUTONOMOUS_EXECUTION',
    reason: 'Policy engine verified: Additional fare ₹8,500 <= ₹20,000 max. Connection buffer 135m >= 90m min.',
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:05:00Z',
    metadata: {
      validationRulesPassed: ['FARE_CHECK', 'CONNECTION_BUFFER', 'CABIN_CLASS', 'SEAT_AVAILABILITY'],
    },
  },
  {
    id: 'AUD-005',
    event: 'REBOOKING_CONFIRMED',
    actor: 'SYSTEM',
    itineraryId: 'TRIP-001',
    decisionId: 'DEC-009',
    action: 'EXECUTE_BOOKING',
    decision: 'CONFIRM_TRANSACTION',
    reason: 'Executed booking API with idempotency key REBOOK-TRIP001-DISRUPTION001-ALT102.',
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:05:25Z',
    metadata: {
      idempotencyKey: 'REBOOK-TRIP001-DISRUPTION001-ALT102',
      pnr: 'PNR-AI-994812',
      status: 'CONFIRMED',
    },
  },
  {
    id: 'AUD-006',
    event: 'HOTEL_SYNCHRONIZATION',
    actor: 'SYSTEM',
    itineraryId: 'TRIP-001',
    action: 'MODIFY_CHECKIN_DATE',
    decision: 'POSTPONE_CHECKIN',
    reason: 'Replacement flight arrives 11 June 05:45 AM. Hotel reservation check-in date adjusted to 11 June 2026.',
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:06:10Z',
    metadata: {
      hotelId: 'HOTEL-LON-001',
      oldCheckIn: '2026-06-10',
      newCheckIn: '2026-06-11',
      actionTaken: 'MODIFY_CHECKIN',
    },
  },
];

export const auditService = {
  async getAuditTrail(itineraryId: string): Promise<ApiResponse<AuditLogEntry[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/${itineraryId}/audit`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) return json;
      }
    } catch {
      // Backend offline fallback
    }

    return {
      success: true,
      data: [...AUDIT_STORE],
      error: null,
    };
  },

  async recordAuditEvent(entry: Partial<AuditLogEntry>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      event: entry.event || 'SYSTEM_ACTION',
      actor: entry.actor || 'SYSTEM',
      itineraryId: entry.itineraryId || 'TRIP-001',
      decisionId: entry.decisionId,
      action: entry.action || '',
      decision: entry.decision,
      reason: entry.reason,
      reasonCodes: entry.reasonCodes,
      confidence: entry.confidence,
      result: entry.result || 'SUCCESS',
      timestamp: new Date().toISOString(),
      metadata: entry.metadata,
    };
    AUDIT_STORE = [newEntry, ...AUDIT_STORE];
    return newEntry;
  },
};
