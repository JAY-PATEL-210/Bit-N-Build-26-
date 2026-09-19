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
