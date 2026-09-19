import { ApiResponse, Disruption, AlternativeFlight } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const disruptionService = {
  async getDisruptions(): Promise<ApiResponse<Disruption[]>> {
    const res = await fetch(`${API_BASE}/api/disruptions`);
    return res.json();
  },

  async getDisruptionById(id: string): Promise<ApiResponse<Disruption>> {
    const res = await fetch(`${API_BASE}/api/disruptions/${id}`);
    return res.json();
  },

  async getAlternatives(disruptionId: string): Promise<ApiResponse<AlternativeFlight[]>> {
    const res = await fetch(`${API_BASE}/api/disruptions/${disruptionId}/alternatives`);
    return res.json();
  },

  async simulateDisruption(payload: { eventType: string; flightId: string; itineraryId: string }): Promise<ApiResponse<Disruption>> {
    const res = await fetch(`${API_BASE}/api/disruptions/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
