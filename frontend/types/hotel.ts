export type HotelAction =
  | "NO_ACTION"
  | "MODIFY_CHECKIN"
  | "MODIFY_CHECKOUT"
  | "CANCEL"
  | "REBOOK"
  | "APPROVAL_REQUIRED";

export interface HotelBooking {
  id: string;
  itineraryId: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  bookingReference: string;
  status: string;
}
