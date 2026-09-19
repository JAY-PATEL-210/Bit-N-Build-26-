// Canonical Enums and Interfaces matching Backend Contract (Sections 15, 18, 19)

export type FlightStatus =
  | "SCHEDULED"
  | "DELAYED"
  | "BOARDING"
  | "DEPARTED"
  | "ARRIVED"
  | "CANCELLED";

export type DisruptionType =
  | "NONE"
  | "DELAY"
  | "CANCELLATION"
  | "MISSED_CONNECTION"
  | "CONNECTION_RISK"
  | "AIRPORT_CHANGE"
  | "ROUTE_CHANGE"
  | "UNKNOWN";

export type DisruptionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RebookingStatus =
  | "PENDING"
  | "ANALYZING"
  | "APPROVAL_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSING"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED";

export type HotelAction =
  | "NO_ACTION"
  | "MODIFY_CHECKIN"
  | "MODIFY_CHECKOUT"
  | "CANCEL"
  | "REBOOK"
  | "APPROVAL_REQUIRED";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: FlightStatus;
  terminal?: string;
  gate?: string;
}

export interface AlternativeFlight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  additionalFare: number;
  policyCompliant: boolean;
  confidence: number;
  explanation?: string;
  reasonCodes?: string[];
  recommended?: boolean;
}

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

export interface Disruption {
  id: string;
  itineraryId: string;
  segmentId: string;
  type: DisruptionType;
  severity: DisruptionSeverity;
  description: string;
  detectedAt: string;
  impact: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: string;
}

export interface AuditLogEntry {
  id: string;
  event: string;
  actor: "USER" | "AI_AGENT" | "SYSTEM" | "EXTERNAL_API" | "ADMIN";
  itineraryId: string;
  decisionId?: string;
  action: string;
  result: string;
  timestamp: string;
}
