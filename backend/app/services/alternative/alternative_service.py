# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Alternative Ranking Service  --  Deterministic scoring (FR-07)
# ──────────────────────────────────────────────────────────────────────────────
from typing import List
from sqlalchemy.orm import Session
from app.models.itinerary import AlternativeFlight, Disruption
from app.services.policy.policy_engine import PolicyEngine
from app.utils.idempotency import generate_id
from app.utils.time import minutes_between
from app.core.logging import logger


class AlternativeService:
    """
    Scores and ranks discovered alternative flights using a deterministic
    weighted formula.  The AI (Member D) feeds candidates; this service
    scores them against policy and traveler preferences.
    """

    # Scoring weights (sum = 1.0)
    W_ARRIVAL = 0.35    # Earlier arrival is better
    W_FARE = 0.25       # Lower additional fare is better
    W_POLICY = 0.25     # Policy-compliant gets bonus
    W_STOPS = 0.15      # Fewer stops is better

    def __init__(self, db: Session):
        self.db = db

    def score_and_persist(
        self,
        disruption: Disruption,
        candidates: list[dict],
        policy: PolicyEngine,
    ) -> List[AlternativeFlight]:
        """
        Score each candidate, persist as AlternativeFlight records,
        and mark the top-scoring compliant option as recommended.
        """
        alternatives = []
        for cand in candidates:
            # Run policy check
            policy_result = policy.validate_alternative(cand)

            score = self._compute_score(cand, candidates, policy_result.compliant)
            explanation = self._build_explanation(cand, score, policy_result)

            alt = AlternativeFlight(
                id=generate_id("ALT-"),
                disruption_id=disruption.id,
                airline=cand.get("airline", "Unknown"),
                flight_number=cand.get("flight_number", ""),
                origin=cand.get("origin", ""),
                destination=cand.get("destination", ""),
                departure_time=cand.get("departure_time"),
                arrival_time=cand.get("arrival_time"),
                duration_minutes=cand.get("duration_minutes"),
                stops=cand.get("stops", 0),
                additional_fare=cand.get("additional_fare", 0),
                currency=cand.get("currency", "INR"),
                policy_compliant=policy_result.compliant,
                policy_violations=policy_result.violations if policy_result.violations else None,
                score=round(score, 2),
                explanation=explanation,
                recommended=False,
            )
            self.db.add(alt)
            alternatives.append(alt)

        # Mark the highest-scoring COMPLIANT alternative as recommended
        compliant = [a for a in alternatives if a.policy_compliant]
        if compliant:
            best = max(compliant, key=lambda a: a.score)
            best.recommended = True

        self.db.commit()
        for alt in alternatives:
            self.db.refresh(alt)

        logger.info(
            "ALTERNATIVES  scored %d candidates for disruption %s  (compliant: %d)",
            len(alternatives), disruption.id, len(compliant),
        )
        return sorted(alternatives, key=lambda a: a.score, reverse=True)

    # ── Scoring Formula ─────────────────────────────────────────────────────
    def _compute_score(self, candidate: dict, all_candidates: list[dict], is_compliant: bool) -> float:
        """
        Score 0-100 using weighted factors.
        Higher = better option for the traveler.
        """
        # Normalize arrival time (earliest gets 100, latest gets 0)
        arrival_score = 100.0  # default if only one candidate
        if len(all_candidates) > 1:
            arrivals = [c.get("arrival_time") for c in all_candidates if c.get("arrival_time")]
            if arrivals:
                earliest = min(arrivals)
                latest = max(arrivals)
                this_arrival = candidate.get("arrival_time", latest)
                if earliest != latest:
                    span = (latest - earliest).total_seconds()
                    delta = (this_arrival - earliest).total_seconds()
                    arrival_score = max(0, 100 * (1 - delta / span))

        # Normalize fare (lowest gets 100, highest gets 0)
        fare_score = 100.0
        fares = [c.get("additional_fare", 0) for c in all_candidates]
        max_fare = max(fares) if fares else 1
        if max_fare > 0:
            fare_score = max(0, 100 * (1 - candidate.get("additional_fare", 0) / max_fare))

        # Policy compliance bonus
        policy_score = 100.0 if is_compliant else 0.0

        # Stops penalty
        stops = candidate.get("stops", 0)
        stops_score = max(0, 100 - stops * 50)

        total = (
            self.W_ARRIVAL * arrival_score
            + self.W_FARE * fare_score
            + self.W_POLICY * policy_score
            + self.W_STOPS * stops_score
        )
        return total

    def _build_explanation(self, candidate: dict, score: float, policy_result) -> str:
        parts = [f"Score: {score:.1f}/100."]
        if policy_result.compliant:
            parts.append("Within corporate travel policy.")
        else:
            parts.append(f"Policy violations: {'; '.join(policy_result.violations)}.")
        fare = candidate.get("additional_fare", 0)
        parts.append(f"Additional fare: Rs.{fare:,.0f}.")
        stops = candidate.get("stops", 0)
        parts.append(f"Stops: {stops}.")
        return " ".join(parts)
