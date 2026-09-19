# Owner: Member D (Backend AI / Agent & Integration)
# Section 26: Flight Evaluator — Ranks & scores candidate alternative flights
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger("AutonomousTravelConcierge.FlightEvaluator")


class FlightEvaluator:
    """
    Evaluates and ranks candidate alternative flights using a deterministic
    multi-factor scoring model. This runs BEFORE the AI decision agent so
    the agent receives pre-scored, pre-filtered candidates.

    Scoring Formula (Section 26, FR-07):
        Score = w1·ArrivalScore + w2·ReliabilityScore + w3·PolicyScore + w4·CostScore + w5·PreferenceScore

    Hard Constraints (instant rejection):
        - additional_fare > policy.maximumAdditionalFare
        - stops > policy.maximumStops
        - connection_time < policy.minimumConnectionMinutes (when applicable)
    """

    # Default scoring weights (tunable)
    DEFAULT_WEIGHTS = {
        "arrival": 0.30,       # Earliest arrival is best
        "reliability": 0.15,   # Airline reliability / on-time performance
        "policy": 0.25,        # Policy compliance margin
        "cost": 0.20,          # Lower additional fare is better
        "preference": 0.10,    # Traveler preference match (direct, seat, etc.)
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS

    def evaluate_alternatives(
        self,
        candidates: List[Dict[str, Any]],
        policy: Dict[str, Any],
        traveler_preferences: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Evaluates, scores, and ranks candidate alternatives.

        Args:
            candidates: Raw candidate flight alternatives from provider
            policy: Travel policy constraints
            traveler_preferences: Optional traveler preferences

        Returns:
            List of scored candidates sorted by score descending,
            each augmented with 'score', 'policy_compliant', and 'rejection_reasons'.
        """
        max_fare = policy.get("maximumAdditionalFare", 20000)
        max_stops = policy.get("maximumStops", 1)
        min_connection = policy.get("minimumConnectionMinutes", 90)
        force_policy_exceeded = policy.get("forcePolicyExceeded", False)

        scored = []
        for candidate in candidates:
            result = self._score_candidate(
                candidate, max_fare, max_stops, min_connection,
                traveler_preferences or {}, force_policy_exceeded
            )
            scored.append(result)

        # Sort: compliant first, then by score descending
        scored.sort(key=lambda x: (x["policy_compliant"], x["score"]), reverse=True)

        logger.info(
            "Evaluated %d candidates: %d compliant, %d rejected",
            len(scored),
            sum(1 for s in scored if s["policy_compliant"]),
            sum(1 for s in scored if not s["policy_compliant"]),
        )

        return scored

    def _score_candidate(
        self,
        candidate: Dict[str, Any],
        max_fare: float,
        max_stops: int,
        min_connection: int,
        preferences: Dict[str, Any],
        force_policy_exceeded: bool = False,
    ) -> Dict[str, Any]:
        """
        Scores a single candidate alternative flight.
        """
        fare = candidate.get("additional_fare", 0)
        stops = candidate.get("stops", 0)
        rejection_reasons = []

        # --- Hard constraint checks ---
        policy_compliant = True

        if force_policy_exceeded:
            # In simulation mode: force all alternatives to exceed policy
            policy_compliant = False
            rejection_reasons.append(
                f"POLICY_EXCEEDED: Fare ₹{fare:,.0f} forced to exceed budget ₹{max_fare:,.0f}"
            )
        else:
            if fare > max_fare:
                policy_compliant = False
                rejection_reasons.append(
                    f"FARE_EXCEEDED: ₹{fare:,.0f} exceeds maximum ₹{max_fare:,.0f}"
                )

            if stops > max_stops:
                policy_compliant = False
                rejection_reasons.append(
                    f"STOPS_EXCEEDED: {stops} stops exceeds maximum {max_stops}"
                )

        connection_minutes = candidate.get("connection_minutes")
        if connection_minutes is not None and connection_minutes < min_connection:
            policy_compliant = False
            rejection_reasons.append(
                f"CONNECTION_TOO_SHORT: {connection_minutes}min < minimum {min_connection}min"
            )

        # --- Soft scoring (0.0 to 1.0 per factor) ---
        arrival_score = self._score_arrival(candidate)
        reliability_score = self._score_reliability(candidate)
        policy_score = self._score_policy_margin(fare, max_fare) if policy_compliant else 0.0
        cost_score = self._score_cost(fare, max_fare)
        preference_score = self._score_preferences(candidate, preferences)

        # Weighted composite score
        total_score = (
            self.weights["arrival"] * arrival_score
            + self.weights["reliability"] * reliability_score
            + self.weights["policy"] * policy_score
            + self.weights["cost"] * cost_score
            + self.weights["preference"] * preference_score
        )

        # Clamp to [0, 1]
        total_score = max(0.0, min(1.0, total_score))

        return {
            **candidate,
            "score": round(total_score, 4),
            "policy_compliant": policy_compliant,
            "rejection_reasons": rejection_reasons,
            "scoring_breakdown": {
                "arrival": round(arrival_score, 4),
                "reliability": round(reliability_score, 4),
                "policy": round(policy_score, 4),
                "cost": round(cost_score, 4),
                "preference": round(preference_score, 4),
            },
        }

    def _score_arrival(self, candidate: Dict[str, Any]) -> float:
        """Score based on arrival time — earlier is better. Uses a simple heuristic."""
        arrival = candidate.get("arrival_time", "")
        # Simple heuristic: earlier arrival times score higher
        # In production this would parse actual datetime and compare
        if isinstance(arrival, str) and ":" in arrival:
            try:
                hour, minute = map(int, arrival.split(":"))
                # Normalize: 0:00 = 1.0, 23:59 = ~0.0
                # But for travel, earlier same-day is better
                return max(0.0, 1.0 - (hour * 60 + minute) / (24 * 60))
            except (ValueError, TypeError):
                pass
        return 0.5  # Default mid-score when arrival time is not parseable

    def _score_reliability(self, candidate: Dict[str, Any]) -> float:
        """Score based on airline reliability / on-time performance."""
        # In production: query historical OTP data
        # For demo: use a simple lookup
        otp_scores = {
            "Air India": 0.75,
            "IndiGo": 0.88,
            "SpiceJet": 0.70,
            "Vistara": 0.85,
            "GoFirst": 0.65,
        }
        airline = candidate.get("airline", "")
        return otp_scores.get(airline, 0.70)

    def _score_policy_margin(self, fare: float, max_fare: float) -> float:
        """Score based on how much margin remains within policy budget."""
        if max_fare <= 0:
            return 0.0
        margin = 1.0 - (fare / max_fare)
        return max(0.0, min(1.0, margin))

    def _score_cost(self, fare: float, max_fare: float) -> float:
        """Lower fare = higher score."""
        if max_fare <= 0:
            return 0.0
        return max(0.0, min(1.0, 1.0 - (fare / (max_fare * 2))))

    def _score_preferences(
        self, candidate: Dict[str, Any], preferences: Dict[str, Any]
    ) -> float:
        """Score based on traveler preference match."""
        score = 0.5  # Base score
        if candidate.get("stops", 1) == 0:
            score += 0.3  # Prefer direct flights
        if preferences.get("preferred_airline") == candidate.get("airline"):
            score += 0.2
        return min(1.0, score)

    def get_compliant_alternatives(
        self, scored_alternatives: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Returns only policy-compliant alternatives from scored list."""
        return [alt for alt in scored_alternatives if alt.get("policy_compliant")]

    def get_best_alternative(
        self, scored_alternatives: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Returns the highest-scored compliant alternative, or None."""
        compliant = self.get_compliant_alternatives(scored_alternatives)
        return compliant[0] if compliant else None


# Singleton convenience
flight_evaluator = FlightEvaluator()
