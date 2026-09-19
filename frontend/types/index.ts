// Canonical Enums and Interfaces matching Backend Contract (Sections 15, 18, 19, 28, 40, 41)

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
  departureTime?: string;
  arrivalTime?: string;
}

export interface AlternativeFlight {
  id: string;
  airline: string;
  flightNumber: string;
  origin?: string;
  destination?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  additionalFare: number;
  currency?: string;
  policyCompliant: boolean;
  confidence: number;
  explanation?: string;
  reasonCodes?: string[];
  recommended?: boolean;
  requiresApproval?: boolean;
  cabin?: string;
  connectionBufferMinutes?: number;
  availableSeats?: number;
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
  originalCheckIn?: string;
  originalCheckOut?: string;
  modifiedCheckIn?: string;
  pricePerNight?: number;
  currency?: string;
  actionTaken?: HotelAction;
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
  affectedFlightNumber?: string;
  affectedSegments?: string[];
  affectedHotelId?: string;
  requiresApproval?: boolean;
  approvalReason?: string;
  recommendedAlternativeId?: string;
}

export interface RebookingRequest {
  id: string;
  disruptionId: string;
  alternativeId: string;
  idempotencyKey: string;
  status: RebookingStatus;
  requiresApproval: boolean;
  approvalReason?: string;
  createdAt: string;
  confirmedAt?: string;
  selectedFlight?: AlternativeFlight;
  hotelAction?: HotelAction;
  hotelStatus?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: string;
  whatHappened?: string;
  whatSystemDid?: string;
  currentStatus?: string;
  whatUserMustDo?: string;
  itineraryId?: string;
  disruptionId?: string;
  newFlightDetails?: string;
  hotelChanges?: string;
  additionalCost?: string;
  confirmationNumber?: string;
}

export interface AuditLogEntry {
  id: string;
  event: string;
  actor: "USER" | "AI_AGENT" | "SYSTEM" | "EXTERNAL_API" | "ADMIN";
  itineraryId: string;
  decisionId?: string;
  action: string;
  decision?: string;
  reason?: string;
  reasonCodes?: string[];
  confidence?: number;
  result: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TravelPolicy {
  maximumAdditionalFare: number;
  currency: string;
  maximumStops: number;
  preferredCabin: string;
  minimumConnectionMinutes: number;
  maximumArrivalDelayHours: number;
  autonomousRebooking: boolean;
  autonomousHotelModification: boolean;
}
