// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 14, 15, 17, 37, 38, 52: Rebooking Service
import { ApiResponse, RebookingRequest } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// In-memory state for client-side demo persistence
const REBOOKING_CACHE: Record<string, RebookingRequest> = {};

export const rebookingService = {
  async previewRebooking(payload: { disruptionId: string; alternativeId: string }): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${API_BASE}/api/rebooking/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Backend offline fallback
    }

    return {
      success: true,
      data: {
        disruptionId: payload.disruptionId,
        alternativeId: payload.alternativeId,
        additionalFare: 8500,
        currency: 'INR',
        policyCompliant: true,
        projectedHotelImpact: 'Check-in date shifted from 10 June to 11 June 05:45 AM',
      },
      error: null,
    };
  },

  async executeRebooking(payload: {
    disruptionId: string;
    alternativeId: string;
    idempotencyKey: string;
  }): Promise<ApiResponse<RebookingRequest>> {
    try {
      const res = await fetch(`${API_BASE}/api/rebooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const req: RebookingRequest = {
            id: json.data.id || `REBOOK-${Date.now()}`,
            disruptionId: payload.disruptionId,
            alternativeId: payload.alternativeId,
            idempotencyKey: payload.idempotencyKey,
            status: 'CONFIRMED',
            requiresApproval: false,
            createdAt: new Date().toISOString(),
            confirmedAt: new Date().toISOString(),
          };
          REBOOKING_CACHE[req.id] = req;
          return { success: true, data: req, error: null };
        }
      }
    } catch {
      // Backend offline fallback
    }

    const newReq: RebookingRequest = {
      id: `REBOOK-${Date.now().toString().slice(-6)}`,
      disruptionId: payload.disruptionId,
      alternativeId: payload.alternativeId,
      idempotencyKey: payload.idempotencyKey,
      status: 'CONFIRMED',
      requiresApproval: false,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      hotelAction: 'MODIFY_CHECKIN',
      hotelStatus: 'CONFIRMED',
    };
    REBOOKING_CACHE[newReq.id] = newReq;

    return {
      success: true,
      data: newReq,
      error: null,
    };
  },

  async approveRebooking(rebookingId: string): Promise<ApiResponse<RebookingRequest>> {
    try {
      const res = await fetch(`${API_BASE}/api/rebooking/${rebookingId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            success: true,
            data: {
              id: rebookingId,
              disruptionId: 'DISRUPT-001',
              alternativeId: 'ALT-104',
              idempotencyKey: `IDEMP-${rebookingId}`,
              status: 'APPROVED',
              requiresApproval: false,
              createdAt: new Date().toISOString(),
              confirmedAt: new Date().toISOString(),
            },
            error: null,
          };
        }
      }
    } catch {
      // Fallback
    }

    const cached = REBOOKING_CACHE[rebookingId] || {
      id: rebookingId,
      disruptionId: 'DISRUPT-001',
      alternativeId: 'ALT-104',
      idempotencyKey: `IDEMP-${rebookingId}`,
      status: 'APPROVED',
      requiresApproval: false,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };
    cached.status = 'APPROVED';
    REBOOKING_CACHE[rebookingId] = cached;

    return {
      success: true,
      data: cached,
      error: null,
    };
  },

  async rejectRebooking(rebookingId: string): Promise<ApiResponse<RebookingRequest>> {
    try {
      const res = await fetch(`${API_BASE}/api/rebooking/${rebookingId}/reject`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            success: true,
            data: {
              id: rebookingId,
              disruptionId: 'DISRUPT-001',
              alternativeId: 'ALT-104',
              idempotencyKey: `IDEMP-${rebookingId}`,
              status: 'REJECTED',
              requiresApproval: false,
              createdAt: new Date().toISOString(),
            },
            error: null,
          };
        }
      }
    } catch {
      // Fallback
    }

    const cached = REBOOKING_CACHE[rebookingId] || {
      id: rebookingId,
      disruptionId: 'DISRUPT-001',
      alternativeId: 'ALT-104',
      idempotencyKey: `IDEMP-${rebookingId}`,
      status: 'REJECTED',
      requiresApproval: false,
      createdAt: new Date().toISOString(),
    };
    cached.status = 'REJECTED';
    REBOOKING_CACHE[rebookingId] = cached;

    return {
      success: true,
      data: cached,
      error: null,
    };
  },

  async getRebookingStatus(rebookingId: string): Promise<ApiResponse<RebookingRequest>> {
    try {
      const res = await fetch(`${API_BASE}/api/rebooking/${rebookingId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json;
      }
    } catch {
      // Fallback
    }

    const item = REBOOKING_CACHE[rebookingId] || {
      id: rebookingId,
      disruptionId: 'DISRUPT-001',
      alternativeId: 'ALT-102',
      idempotencyKey: `IDEMP-${rebookingId}`,
      status: 'CONFIRMED',
      requiresApproval: false,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: item,
      error: null,
    };
  },
};
