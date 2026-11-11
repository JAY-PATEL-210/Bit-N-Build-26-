// Owner: Member B (Frontend Systems / Interaction & Demo)
// Rebooking Service backed by Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiResponse, RebookingRequest } from '../types';

export const rebookingService = {
  async previewRebooking(payload: { disruptionId: string; alternativeId: string }): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        disruptionId: payload.disruptionId,
        alternativeId: payload.alternativeId,
        additionalFare: 8500,
        currency: 'INR',
        policyCompliant: true,
        projectedHotelImpact: 'Check-in date shifted automatically to align with new flight arrival',
      },
      error: null,
    };
  },

  async executeRebooking(payload: {
    disruptionId: string;
    alternativeId: string;
    idempotencyKey: string;
  }): Promise<ApiResponse<RebookingRequest>> {
    const rebookId = `REBOOK-${Date.now().toString().slice(-6)}`;
    const newReq: RebookingRequest = {
      id: rebookId,
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

    try {
      await setDoc(doc(db, 'rebooking_requests', rebookId), newReq);
    } catch (err) {
      console.error('Firestore executeRebooking error:', err);
    }

    return {
      success: true,
      data: newReq,
      error: null,
    };
  },

  async approveRebooking(rebookingId: string): Promise<ApiResponse<RebookingRequest>> {
    try {
      const ref = doc(db, 'rebooking_requests', rebookingId);
      await updateDoc(ref, { status: 'APPROVED', confirmedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Firestore approveRebooking error:', err);
    }

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
  },

  async rejectRebooking(rebookingId: string): Promise<ApiResponse<RebookingRequest>> {
    try {
      const ref = doc(db, 'rebooking_requests', rebookingId);
      await updateDoc(ref, { status: 'REJECTED' });
    } catch (err) {
      console.error('Firestore rejectRebooking error:', err);
    }

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
  },

  async getRebookingStatus(rebookingId: string): Promise<ApiResponse<RebookingRequest>> {
    try {
      const d = await getDoc(doc(db, 'rebooking_requests', rebookingId));
      if (d.exists()) {
        return {
          success: true,
          data: { id: d.id, ...d.data() } as RebookingRequest,
          error: null,
        };
      }
    } catch (err) {
      console.error('Firestore getRebookingStatus error:', err);
    }

    return {
      success: true,
      data: {
        id: rebookingId,
        disruptionId: 'DISRUPT-001',
        alternativeId: 'ALT-102',
        idempotencyKey: `IDEMP-${rebookingId}`,
        status: 'CONFIRMED',
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
      },
      error: null,
    };
  },
};
