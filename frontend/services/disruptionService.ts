// Owner: Member B (Frontend Systems / Interaction & Demo)
// Disruption Service backed by Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiResponse, Disruption, AlternativeFlight } from '../types';

export const disruptionService = {
  async getDisruptions(): Promise<ApiResponse<Disruption[]>> {
    try {
      const snap = await getDocs(collection(db, 'disruptions'));
      if (!snap.empty) {
        const disruptions = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as Disruption));
        return {
          success: true,
          data: disruptions,
          error: null,
        };
      }
    } catch (err: any) {
      console.error('Firestore getDisruptions error:', err);
    }

    return {
      success: true,
      data: [],
      error: null,
    };
  },

  async getDisruptionById(id: string): Promise<ApiResponse<Disruption>> {
    try {
      const d = await getDoc(doc(db, 'disruptions', id));
      if (d.exists()) {
        return {
          success: true,
          data: { id: d.id, ...d.data() } as Disruption,
          error: null,
        };
      }
    } catch (err: any) {
      console.error('Firestore getDisruptionById error:', err);
    }

    return {
      success: false,
      data: null as any,
      error: { code: 'NOT_FOUND', message: 'Disruption not found in Firestore' },
    };
  },

  async getAlternatives(disruptionId: string): Promise<ApiResponse<AlternativeFlight[]>> {
    try {
      const snap = await getDocs(collection(db, 'alternative_flights'));
      if (!snap.empty) {
        const alts = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as AlternativeFlight));
        return {
          success: true,
          data: alts,
          error: null,
        };
      }
    } catch (err: any) {
      console.error('Firestore getAlternatives error:', err);
    }

    return {
      success: true,
      data: [],
      error: null,
    };
  },

  async simulateDisruption(payload: {
    eventType: string;
    flightId?: string;
    itineraryId?: string;
  }): Promise<ApiResponse<Disruption>> {
    const isDelay = payload.eventType.includes('DELAY');
    const disruptionId = `DISRUPT-${Date.now().toString().slice(-4)}`;

    const newDisruption: Disruption = {
      id: disruptionId,
      itineraryId: payload.itineraryId || 'TRIP-A',
      segmentId: 'SEG-TRIP-A-1',
      type: isDelay ? 'DELAY' : 'CANCELLATION',
      severity: isDelay ? 'HIGH' : 'CRITICAL',
      description: isDelay
        ? 'Flight AI101 delayed by 180 minutes. Feeder arrival compromised.'
        : 'Flight AI101 CANCELLED. Feeder connection disrupted.',
      detectedAt: new Date().toISOString(),
      impact: isDelay
        ? 'Connection buffer reduced to 15 minutes (< 90 min minimum requirement).'
        : 'Cascading disruption: Downstream connections impacted.',
      status: 'DECISION_READY',
      affectedFlightNumber: 'AI101',
      affectedSegments: ['SEG-TRIP-A-1'],
      affectedHotelId: 'HTL-TRIP-A',
      recommendedAlternativeId: 'ALT-102',
      requiresApproval: false,
    };

    try {
      await setDoc(doc(db, 'disruptions', disruptionId), newDisruption);
    } catch (err) {
      console.error('Firestore simulateDisruption error:', err);
    }

    return {
      success: true,
      data: newDisruption,
      error: null,
    };
  },
};
