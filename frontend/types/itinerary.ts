import { Flight } from './flight';
import { HotelBooking } from './hotel';

export interface Itinerary {
  id: string;
  userId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  status: string;
  flights: Flight[];
  hotel?: HotelBooking;
}
