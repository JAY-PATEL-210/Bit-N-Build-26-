// Owner: Member B (Frontend Systems / Interaction & Demo)
// Flight Service with Company operations backed by Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ApiResponse,
  CancelFlightPayload,
  CreateFlightPayload,
  DelayFlightPayload,
  Flight,
} from '../types';
import { notificationService } from './notificationService';

export const flightService = {
  /**
   * Get list of all flights from Firebase Firestore
   */
  async getFlights(): Promise<ApiResponse<Flight[]>> {
    try {
      const snap = await getDocs(collection(db, 'flights'));
      const flights: Flight[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          airline: data.airline || 'Demo Airlines',
          flightNumber: data.flightNumber || data.flight_number || '',
          origin: data.origin || '',
          destination: data.destination || '',
          scheduledDeparture: data.scheduledDeparture || data.scheduled_departure || '',
          scheduledArrival: data.scheduledArrival || data.scheduled_arrival || '',
          estimatedDeparture: data.estimatedDeparture || data.estimated_departure,
          estimatedArrival: data.estimatedArrival || data.estimated_arrival,
          actualDeparture: data.actualDeparture || data.actual_departure,
          actualArrival: data.actualArrival || data.actual_arrival,
          status: data.status || 'SCHEDULED',
          terminal: data.terminal || 'T1',
          gate: data.gate || 'G1',
          departureTime: data.departureTime || (data.scheduledDeparture ? data.scheduledDeparture.slice(11, 16) : '10:00'),
          arrivalTime: data.arrivalTime || (data.scheduledArrival ? data.scheduledArrival.slice(11, 16) : '12:30'),
          itineraryId: data.itineraryId || data.itinerary_id,
        };
      });

      return {
        success: true,
        data: flights,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore getFlights error:', err);
      return {
        success: false,
        data: [],
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  /**
   * Get single flight by ID from Firebase Firestore
   */
  async getFlight(id: string): Promise<ApiResponse<Flight>> {
    try {
      const d = await getDoc(doc(db, 'flights', id));
      if (!d.exists()) {
        return {
          success: false,
          data: null as any,
          error: { code: 'NOT_FOUND', message: `Flight ${id} not found.` },
        };
      }
      const data = d.data();
      const flight: Flight = {
        id: d.id,
        airline: data.airline || 'Demo Airlines',
        flightNumber: data.flightNumber || data.flight_number || '',
        origin: data.origin || '',
        destination: data.destination || '',
        scheduledDeparture: data.scheduledDeparture || data.scheduled_departure || '',
        scheduledArrival: data.scheduledArrival || data.scheduled_arrival || '',
        estimatedDeparture: data.estimatedDeparture || data.estimated_departure,
        estimatedArrival: data.estimatedArrival || data.estimated_arrival,
        actualDeparture: data.actualDeparture || data.actual_departure,
        actualArrival: data.actualArrival || data.actual_arrival,
        status: data.status || 'SCHEDULED',
        terminal: data.terminal || 'T1',
        gate: data.gate || 'G1',
        departureTime: data.departureTime || (data.scheduledDeparture ? data.scheduledDeparture.slice(11, 16) : '10:00'),
        arrivalTime: data.arrivalTime || (data.scheduledArrival ? data.scheduledArrival.slice(11, 16) : '12:30'),
        itineraryId: data.itineraryId || data.itinerary_id,
      };
      return {
        success: true,
        data: flight,
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  /**
   * Get live status of single flight
   */
  async getFlightStatus(
    id: string
  ): Promise<ApiResponse<{ status: string; estimatedDeparture?: string; estimatedArrival?: string }>> {
    const res = await this.getFlight(id);
    if (!res.success || !res.data) {
      return {
        success: false,
        data: null as any,
        error: res.error,
      };
    }
    return {
      success: true,
      data: {
        status: res.data.status,
        estimatedDeparture: res.data.estimatedDeparture,
        estimatedArrival: res.data.estimatedArrival,
      },
      error: null,
    };
  },

  /**
   * Add a new flight (Company action) to Firebase Firestore
   */
  async createFlight(payload: CreateFlightPayload): Promise<ApiResponse<Flight>> {
    try {
      const flightId = `FLIGHT-${Date.now().toString().slice(-4)}`;
      const newFlight: Flight = {
        id: flightId,
        airline: payload.airline,
        flightNumber: payload.flightNumber,
        origin: payload.origin,
        destination: payload.destination,
        scheduledDeparture: payload.scheduledDeparture,
        scheduledArrival: payload.scheduledArrival,
        status: 'SCHEDULED',
        terminal: payload.terminal || 'T1',
        gate: payload.gate || 'G10',
        departureTime: payload.scheduledDeparture.slice(11, 16) || '10:00',
        arrivalTime: payload.scheduledArrival.slice(11, 16) || '14:00',
      };

      await setDoc(doc(db, 'flights', flightId), newFlight);

      return {
        success: true,
        data: newFlight,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore createFlight error:', err);
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  /**
   * Cancel flight with mandatory company reason in Firebase Firestore
   */
  async cancelFlight(id: string, payload: CancelFlightPayload): Promise<ApiResponse<Flight>> {
    if (!payload.reason || !payload.reason.trim()) {
      return {
        success: false,
        data: null as any,
        error: { code: 'VALIDATION_ERROR', message: 'Cancellation reason is required.' },
      };
    }

    try {
      const flightRef = doc(db, 'flights', id);
      const existing = await getDoc(flightRef);

      let flightData: Flight;
      if (existing.exists()) {
        await updateDoc(flightRef, { status: 'CANCELLED' });
        flightData = { ...(existing.data() as Flight), id, status: 'CANCELLED' };
      } else {
        flightData = {
          id,
          airline: 'Demo Airlines',
          flightNumber: 'AI101',
          origin: 'AMD',
          destination: 'DEL',
          scheduledDeparture: new Date().toISOString(),
          scheduledArrival: new Date().toISOString(),
          status: 'CANCELLED',
        };
        await setDoc(flightRef, flightData);
      }

      // Record disruption in Firestore
      const disruptionId = `DISRUPT-${Date.now().toString().slice(-4)}`;
      await setDoc(doc(db, 'disruptions', disruptionId), {
        id: disruptionId,
        itineraryId: flightData.itineraryId || 'TRIP-A',
        segmentId: flightIdToSegment(id),
        type: 'CANCELLATION',
        severity: 'CRITICAL',
        description: `Flight ${flightData.flightNumber} (${flightData.origin} → ${flightData.destination}) CANCELLED: ${payload.reason}`,
        detectedAt: new Date().toISOString(),
        impact: `Flight cancelled. Airline reason: "${payload.reason}". Autonomous concierge evaluating alternatives.`,
        status: 'DECISION_READY',
        affectedFlightNumber: flightData.flightNumber,
      });

      // Create traveler notification carrying the exact company cancellation reason
      await notificationService.addNotification({
        title: `Flight ${flightData.flightNumber} Cancelled by Airline`,
        message: `Airline announced cancellation for ${flightData.flightNumber} (${flightData.origin} → ${flightData.destination}).`,
        type: 'CRITICAL_DISRUPTION',
        reason: payload.reason,
        whatHappened: `Flight ${flightData.flightNumber} (${flightData.origin} → ${flightData.destination}) status changed to CANCELLED.`,
        whatSystemDid: 'Analyzed downstream itinerary, detected connection risk, and searched eligible replacement routes.',
        currentStatus: 'Flight CANCELLED by Airline Operations',
        whatUserMustDo: 'Review replacement alternatives on your traveler dashboard.',
        itineraryId: flightData.itineraryId || 'TRIP-A',
        disruptionId,
      });

      return {
        success: true,
        data: flightData,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore cancelFlight error:', err);
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  /**
   * Delay flight with mandatory company reason in Firebase Firestore
   */
  async delayFlight(id: string, payload: DelayFlightPayload): Promise<ApiResponse<Flight>> {
    if (!payload.reason || !payload.reason.trim()) {
      return {
        success: false,
        data: null as any,
        error: { code: 'VALIDATION_ERROR', message: 'Delay reason is required.' },
      };
    }

    try {
      const flightRef = doc(db, 'flights', id);
      const existing = await getDoc(flightRef);

      let flightData: Flight;
      const updates = {
        status: 'DELAYED' as const,
        estimatedDeparture: payload.newDepartureTime,
        estimatedArrival: payload.newArrivalTime,
        departureTime: payload.newDepartureTime.slice(11, 16),
        arrivalTime: payload.newArrivalTime.slice(11, 16),
      };

      if (existing.exists()) {
        await updateDoc(flightRef, updates);
        flightData = { ...(existing.data() as Flight), id, ...updates };
      } else {
        flightData = {
          id,
          airline: 'Demo Airlines',
          flightNumber: '6E202',
          origin: 'BOM',
          destination: 'BLR',
          scheduledDeparture: new Date().toISOString(),
          scheduledArrival: new Date().toISOString(),
          ...updates,
        };
        await setDoc(flightRef, flightData);
      }

      // Record disruption in Firestore
      const disruptionId = `DISRUPT-${Date.now().toString().slice(-4)}`;
      await setDoc(doc(db, 'disruptions', disruptionId), {
        id: disruptionId,
        itineraryId: flightData.itineraryId || 'TRIP-B',
        segmentId: flightIdToSegment(id),
        type: 'DELAY',
        severity: 'HIGH',
        description: `Flight ${flightData.flightNumber} delayed. New departure: ${payload.newDepartureTime}`,
        detectedAt: new Date().toISOString(),
        impact: `Connection buffer reduced. Reason: "${payload.reason}".`,
        status: 'SEARCHING_ALTERNATIVES',
        affectedFlightNumber: flightData.flightNumber,
      });

      // Create traveler notification carrying the exact company delay reason
      await notificationService.addNotification({
        title: `Flight ${flightData.flightNumber} Schedule Delayed`,
        message: `Flight ${flightData.flightNumber} delayed. Estimated departure: ${payload.newDepartureTime}.`,
        type: 'WARNING',
        reason: payload.reason,
        whatHappened: `Flight ${flightData.flightNumber} status changed to DELAYED.`,
        whatSystemDid: 'Re-calculated minimum connection time for downstream transfer.',
        currentStatus: `DELAYED (New Dep: ${payload.newDepartureTime.slice(11, 16) || 'TBD'})`,
        whatUserMustDo: 'Ensure arrival at terminal 2 hours prior to updated schedule.',
        itineraryId: flightData.itineraryId || 'TRIP-B',
        disruptionId,
      });

      return {
        success: true,
        data: flightData,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore delayFlight error:', err);
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },
};

function flightIdToSegment(flightId: string): string {
  if (flightId.includes('TRIP-A')) return 'SEG-TRIP-A-1';
  if (flightId.includes('TRIP-B')) return 'SEG-TRIP-B-1';
  if (flightId.includes('TRIP-C')) return 'SEG-TRIP-C-1';
  if (flightId.includes('TRIP-D')) return 'SEG-TRIP-D-1';
  return 'SEG-TRIP-A-1';
}
