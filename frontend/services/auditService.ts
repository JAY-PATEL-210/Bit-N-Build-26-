import { apiRequest } from './apiClient';
import { ApiResponse } from '../types/common';

export const auditService = {
  getAuditTrail(itineraryId: string): Promise<ApiResponse<any[]>> {
    return apiRequest<ApiResponse<any[]>>(`/api/itineraries/${itineraryId}/audit`);
  },
};
