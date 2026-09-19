import { ApiResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const rebookingService = {
  async previewRebooking(payload: { disruptionId: string; alternativeId: string }): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/api/rebooking/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async executeRebooking(payload: { disruptionId: string; alternativeId: string; idempotencyKey: string }): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/api/rebooking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async approveRebooking(rebookingId: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/api/rebooking/${rebookingId}/approve`, {
      method: 'POST',
    });
    return res.json();
  },

  async rejectRebooking(rebookingId: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/api/rebooking/${rebookingId}/reject`, {
      method: 'POST',
    });
    return res.json();
  },

  async getRebookingStatus(rebookingId: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/api/rebooking/${rebookingId}`);
    return res.json();
  },
};
