import { ApiResponse, Flight } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const flightService = {
  async getFlight(id: string): Promise<ApiResponse<Flight>> {
    const res = await fetch(`${API_BASE}/api/flights/${id}`);
    return res.json();
  },

  async getFlightStatus(id: string): Promise<ApiResponse<{ status: string; estimatedDeparture?: string; estimatedArrival?: string }>> {
    const res = await fetch(`${API_BASE}/api/flights/${id}/status`);
    return res.json();
  },
};
