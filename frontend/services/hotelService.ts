// Owner: Member B (Frontend Systems / Interaction & Demo)
// Hotel Service backed by Firebase Firestore
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiResponse, HotelBooking } from '../types';

export const hotelService = {
  async getHotelsByItinerary(itineraryId: string): Promise<ApiResponse<HotelBooking[]>> {
    try {
      const q = query(collection(db, 'hotel_bookings'), where('itineraryId', '==', itineraryId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const hotels: HotelBooking[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as HotelBooking));
        return { success: true, data: hotels, error: null };
      }

      // If no exact itinerary match, return all hotels from Firestore
      const allSnap = await getDocs(collection(db, 'hotel_bookings'));
      const allHotels: HotelBooking[] = allSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as HotelBooking));

      return {
        success: true,
        data: allHotels,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore getHotels error:', err);
      return {
        success: false,
        data: [],
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  async modifyHotel(
    hotelId: string,
    payload: { checkIn: string; checkOut?: string; reason?: string }
  ): Promise<ApiResponse<HotelBooking>> {
    try {
      const hotelRef = doc(db, 'hotel_bookings', hotelId);
      const existing = await getDoc(hotelRef);
      const currentData = existing.exists() ? existing.data() : {};

      const updated: HotelBooking = {
        id: hotelId,
        itineraryId: currentData.itineraryId || 'TRIP-A',
        hotelName: currentData.hotelName || 'Hilton Delhi',
        location: currentData.location || 'New Delhi, India',
        checkIn: payload.checkIn,
        checkOut: payload.checkOut || currentData.checkOut || '2026-09-25T10:00:00Z',
        bookingReference: currentData.bookingReference || `HTL-${hotelId}`,
        status: 'MODIFIED_AUTOMATICALLY',
        originalCheckIn: currentData.originalCheckIn || currentData.checkIn,
        modifiedCheckIn: payload.checkIn,
        price: currentData.price || 15000,
        currency: currentData.currency || 'INR',
        actionTaken: 'MODIFY_CHECKIN',
      };

      await setDoc(hotelRef, updated, { merge: true });

      return {
        success: true,
        data: updated,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore modifyHotel error:', err);
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },
};
