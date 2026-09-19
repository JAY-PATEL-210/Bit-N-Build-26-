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

export interface RebookingRequest {
  id: string;
  disruptionId: string;
  alternativeId: string;
  idempotencyKey: string;
  status: RebookingStatus;
}
