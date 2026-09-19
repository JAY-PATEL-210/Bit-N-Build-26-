# Owner: Member D (Backend AI / Agent & Integration)
# Section 26: Context Builder — Compiles structured context for AI decision-making
from typing import Dict, Any, List, Optional
from datetime import datetime


class ContextBuilder:
    """
    Builds a comprehensive, structured context packet from raw disruption data,
    itinerary information, and travel policy. This context is the ONLY input
    the AI decision agent receives — it never queries databases or APIs directly.

    Responsibility chain:
        DisruptionEvent -> ContextBuilder -> structured_context -> DecisionAgent
    """

    def build_disruption_context(
        self,
        disruption_event: Dict[str, Any],
        itinerary: Dict[str, Any],
        policy: Dict[str, Any],
        candidate_alternatives: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Assembles a complete context packet for the AI decision agent.

        Args:
            disruption_event: Raw disruption event payload (eventType, flightId, etc.)
            itinerary: Full itinerary data (segments, hotel, traveler info)
            policy: Corporate travel policy constraints
            candidate_alternatives: Pre-fetched candidate alternative flights

        Returns:
            Structured context dict containing all information needed for decision-making.
        """
        affected_segments = self._identify_affected_segments(
            disruption_event, itinerary
        )
        downstream_impacts = self._compute_downstream_impacts(
            disruption_event, itinerary
        )

        context = {
            "disruption": {
                "id": disruption_event.get("disruptionId", f"DIS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"),
                "event_type": disruption_event.get("eventType"),
                "flight_id": disruption_event.get("flightId"),
                "delay_minutes": disruption_event.get("delayMinutes", 0),
                "timestamp": disruption_event.get("timestamp", datetime.utcnow().isoformat()),
                "force_policy_exceeded": disruption_event.get("forcePolicyExceeded", False),
            },
            "itinerary": {
                "id": itinerary.get("id", disruption_event.get("itineraryId", "UNKNOWN")),
                "traveler": itinerary.get("traveler", {
                    "name": "Demo Traveler",
                    "email": "traveler@example.com",
                    "preferences": {"seat": "window", "meal": "vegetarian"},
                }),
                "segments": itinerary.get("segments", []),
                "hotel": itinerary.get("hotel"),
            },
            "affected_segments": affected_segments,
            "downstream_impacts": downstream_impacts,
            "policy": {
                "maximum_additional_fare": policy.get("maximumAdditionalFare", 20000),
                "currency": policy.get("currency", "INR"),
                "maximum_stops": policy.get("maximumStops", 1),
                "minimum_connection_minutes": policy.get("minimumConnectionMinutes", 90),
                "autonomous_rebooking": policy.get("autonomousRebooking", True),
                "autonomous_hotel_modification": policy.get("autonomousHotelModification", True),
            },
            "candidate_alternatives": candidate_alternatives,
            "metadata": {
                "context_built_at": datetime.utcnow().isoformat(),
                "total_candidates": len(candidate_alternatives),
                "total_affected_segments": len(affected_segments),
            },
        }

        return context

    def _identify_affected_segments(
        self, disruption_event: Dict[str, Any], itinerary: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Identifies which itinerary segments are directly affected by the disruption.
        """
        affected = []
        flight_id = disruption_event.get("flightId")
        segments = itinerary.get("segments", [])

        for segment in segments:
            if segment.get("flight_id") == flight_id:
                affected.append({
                    **segment,
                    "impact": "DIRECT",
                    "reason": f"Flight {flight_id} is {disruption_event.get('eventType', 'DISRUPTED')}",
                })

        return affected

    def _compute_downstream_impacts(
        self, disruption_event: Dict[str, Any], itinerary: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Computes downstream impacts: connecting flights that may be missed,
        hotel reservations that may need adjustment, etc.
        """
        impacts = []
        event_type = disruption_event.get("eventType")
        flight_id = disruption_event.get("flightId")
        segments = itinerary.get("segments", [])
        delay_minutes = disruption_event.get("delayMinutes", 0)

        # Find the disrupted segment index
        disrupted_idx = None
        for idx, seg in enumerate(segments):
            if seg.get("flight_id") == flight_id:
                disrupted_idx = idx
                break

        # If flight is cancelled or severely delayed, all downstream segments are affected
        if disrupted_idx is not None:
            for downstream_seg in segments[disrupted_idx + 1:]:
                if event_type == "FLIGHT_CANCELLED":
                    impacts.append({
                        "segment": downstream_seg,
                        "impact_type": "CONNECTION_BROKEN",
                        "reason": f"Upstream flight {flight_id} cancelled; connection impossible.",
                    })
                elif event_type == "FLIGHT_DELAYED" and delay_minutes >= 90:
                    impacts.append({
                        "segment": downstream_seg,
                        "impact_type": "CONNECTION_RISK",
                        "reason": f"Upstream flight {flight_id} delayed by {delay_minutes}min; "
                                  f"minimum connection time may be breached.",
                    })

        # Hotel impact assessment
        hotel = itinerary.get("hotel")
        if hotel and (event_type == "FLIGHT_CANCELLED" or delay_minutes >= 120):
            impacts.append({
                "segment": hotel,
                "impact_type": "HOTEL_CHECK_IN_DELAYED",
                "reason": f"Flight disruption may delay hotel check-in at {hotel.get('name', 'hotel')}.",
            })

        return impacts


# Singleton convenience
context_builder = ContextBuilder()
