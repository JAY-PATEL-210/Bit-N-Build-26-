// Owner: Member A (Frontend Lead) & Member C (Backend Services)
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiResponse, Itinerary, Flight, HotelBooking } from '../types';

export const itineraryService = {
  async getItineraries(): Promise<ApiResponse<Itinerary[]>> {
    try {
      const itinerariesSnap = await getDocs(collection(db, 'itineraries'));
      const list: Itinerary[] = [];

      for (const d of itinerariesSnap.docs) {
        const itinData = d.data();
        const itinId = d.id;

        // Fetch associated flights
        const flightsQuery = query(collection(db, 'flights'), where('itineraryId', '==', itinId));
        const flightsSnap = await getDocs(flightsQuery);
        const flights: Flight[] = flightsSnap.docs.map(fd => {
          const f = fd.data();
          return {
            id: fd.id,
            airline: f.airline || 'Demo Airlines',
            flightNumber: f.flightNumber || f.flight_number || '',
            origin: f.origin || '',
            destination: f.destination || '',
            scheduledDeparture: f.scheduledDeparture || f.scheduled_departure || '',
            scheduledArrival: f.scheduledArrival || f.scheduled_arrival || '',
            estimatedDeparture: f.estimatedDeparture || f.estimated_departure,
            estimatedArrival: f.estimatedArrival || f.estimated_arrival,
            actualDeparture: f.actualDeparture || f.actual_departure,
            actualArrival: f.actualArrival || f.actual_arrival,
            status: f.status || 'SCHEDULED',
            terminal: f.terminal,
            gate: f.gate,
            itineraryId: itinId,
          };
        });

        // Fetch associated hotel
        const hotelQuery = query(collection(db, 'hotel_bookings'), where('itineraryId', '==', itinId));
        const hotelSnap = await getDocs(hotelQuery);
        let hotel: HotelBooking | undefined = undefined;
        if (!hotelSnap.empty) {
          const hd = hotelSnap.docs[0].data();
          hotel = {
            id: hotelSnap.docs[0].id,
            itineraryId: itinId,
            hotelName: hd.hotelName || hd.hotel_name || '',
            location: hd.location || '',
            checkIn: hd.checkIn || hd.check_in || '',
            checkOut: hd.checkOut || hd.check_out || '',
            bookingReference: hd.bookingReference || hd.booking_reference,
            price: hd.price,
            currency: hd.currency || 'INR',
            status: hd.status || 'CONFIRMED',
          };
        }

        list.push({
          id: itinId,
          userId: itinData.userId || itinData.user_id || '',
          tripName: itinData.tripName || itinData.trip_name || 'Business Trip',
          startDate: itinData.startDate || itinData.start_date || '',
          endDate: itinData.endDate || itinData.end_date || '',
          status: itinData.status || 'ACTIVE',
          flights,
          hotel,
        });
      }

      return {
        success: true,
        data: list,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore getItineraries error:', err);
      return {
        success: false,
        data: [],
        error: { code: 'FIRESTORE_ERROR', message: err.message || 'Failed to fetch itineraries' },
      };
    }
  },

  async getItineraryById(id: string): Promise<ApiResponse<Itinerary>> {
    try {
      const itinDoc = await getDoc(doc(db, 'itineraries', id));
      if (!itinDoc.exists()) {
        return {
          success: false,
          data: null as any,
          error: { code: 'NOT_FOUND', message: 'Itinerary not found in Firebase' },
        };
      }

      const itinData = itinDoc.data();

      // Flights
      const flightsQuery = query(collection(db, 'flights'), where('itineraryId', '==', id));
      const flightsSnap = await getDocs(flightsQuery);
      const flights: Flight[] = flightsSnap.docs.map(fd => ({
        id: fd.id,
        ...fd.data(),
      } as Flight));

      // Hotel
      const hotelQuery = query(collection(db, 'hotel_bookings'), where('itineraryId', '==', id));
      const hotelSnap = await getDocs(hotelQuery);
      let hotel: HotelBooking | undefined = undefined;
      if (!hotelSnap.empty) {
        hotel = {
          id: hotelSnap.docs[0].id,
          ...hotelSnap.docs[0].data(),
        } as HotelBooking;
      }

      return {
        success: true,
        data: {
          id: itinDoc.id,
          userId: itinData.userId || itinData.user_id || '',
          tripName: itinData.tripName || itinData.trip_name || '',
          startDate: itinData.startDate || itinData.start_date || '',
          endDate: itinData.endDate || itinData.end_date || '',
          status: itinData.status || 'ACTIVE',
          flights,
          hotel,
        },
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore getItineraryById error:', err);
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message || 'Failed to load itinerary' },
      };
    }
  },

  async createItinerary(payload: Partial<Itinerary>): Promise<ApiResponse<Itinerary>> {
    try {
      const itinId = payload.id || `TRIP-${Date.now().toString().slice(-4)}`;
      const newItin: Itinerary = {
        id: itinId,
        userId: payload.userId || 'USER-DEMO-01',
        tripName: payload.tripName || 'New Trip',
        startDate: payload.startDate || new Date().toISOString(),
        endDate: payload.endDate || new Date().toISOString(),
        status: payload.status || 'ACTIVE',
        flights: payload.flights || [],
        hotel: payload.hotel,
      };

      await setDoc(doc(db, 'itineraries', itinId), {
        id: itinId,
        userId: newItin.userId,
        tripName: newItin.tripName,
        startDate: newItin.startDate,
        endDate: newItin.endDate,
        status: newItin.status,
      });

      // Save flights if any
      if (payload.flights && payload.flights.length > 0) {
        for (const flt of payload.flights) {
          const fltId = flt.id || `FLT-${itinId}-${Date.now().toString().slice(-3)}`;
          await setDoc(doc(db, 'flights', fltId), {
            ...flt,
            id: fltId,
            itineraryId: itinId,
          });
        }
      }

      // Save hotel if any
      if (payload.hotel) {
        const htlId = payload.hotel.id || `HTL-${itinId}`;
        await setDoc(doc(db, 'hotel_bookings', htlId), {
          ...payload.hotel,
          id: htlId,
          itineraryId: itinId,
        });
      }

      return {
        success: true,
        data: newItin,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore createItinerary error:', err);
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message || 'Failed to create itinerary' },
      };
    }
  },
};
