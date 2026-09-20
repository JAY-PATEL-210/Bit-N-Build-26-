# Owner: Member D (Backend AI / Agent & Integration)
# ──────────────────────────────────────────────────────────────────────────────
# AI Analysis Endpoint  --  Exposes the full 5-layer orchestration pipeline
# FR-06, FR-07, FR-08, FR-09, FR-10 | Section 26-30
# ──────────────────────────────────────────────────────────────────────────────
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import ApiResponse, ApiError
from app.models.itinerary import Disruption, TravelSegment, Flight, HotelBooking, Itinerary, TravelPreferences
from app.agents.context_builder import ContextBuilder
from app.agents.flight_evaluator import FlightEvaluator
from app.agents.decision_agent.decision_agent import DecisionAgent
from app.agents.guardrails import AiGuardrails
from app.services.policy.policy_engine import PolicyEngine
from app.utils.casing import to_camel_case
from app.core.logging import logger

router = APIRouter()


# ─── Request / Response Schemas ────────────────────────────────────────────

class AiAnalysisRequest(BaseModel):
    disruption_id: str = Field(..., description="ID of the active disruption to analyze")
    force_policy_exceeded: bool = Field(
        default=False,
        description="Simulation flag: force all alternatives to exceed policy (tests escalation path)"
    )
    itinerary_id: Optional[str] = Field(
        default=None,
        description="Itinerary ID override (auto-detected from disruption if omitted)"
    )


# ─── Helpers ───────────────────────────────────────────────────────────────

def _build_itinerary_payload(db: Session, disruption: Disruption) -> dict:
    """Build itinerary dict from DB records for orchestration pipeline."""
    itinerary = db.query(Itinerary).filter(Itinerary.id == disruption.itinerary_id).first()
    if not itinerary:
        return {"id": disruption.itinerary_id, "segments": [], "traveler": {}}

    # Get user preferences
    prefs = db.query(TravelPreferences).filter(TravelPreferences.user_id == itinerary.user_id).first()
    traveler = {
        "name": itinerary.user.name if itinerary.user else "Traveler",
        "email": itinerary.user.email if itinerary.user else "traveler@example.com",
        "preferences": {
            "seat": "window",
            "meal": "vegetarian",
            "preferred_cabin": prefs.preferred_cabin if prefs else "ECONOMY",
        },
    }

    # Get flight segments in order
    segments_db = (
        db.query(TravelSegment)
        .filter(TravelSegment.itinerary_id == disruption.itinerary_id)
        .order_by(TravelSegment.sequence_order)
        .all()
    )
    segments = []
    for seg in segments_db:
        flight = seg.flight
        if flight:
            segments.append({
                "segment_id": seg.id,
                "flight_id": flight.flight_number,
                "airline": flight.airline,
                "origin": flight.origin,
                "destination": flight.destination,
                "departure_time": flight.scheduled_departure.isoformat() if flight.scheduled_departure else None,
                "arrival_time": flight.scheduled_arrival.isoformat() if flight.scheduled_arrival else None,
                "status": flight.status,
            })

    # Get hotel
    hotel_db = (
        db.query(HotelBooking)
        .filter(HotelBooking.itinerary_id == disruption.itinerary_id)
        .first()
    )
    hotel = None
    if hotel_db:
        hotel = {
            "hotel_id": hotel_db.id,
            "name": hotel_db.hotel_name,
            "check_in": hotel_db.check_in.strftime("%Y-%m-%d") if hotel_db.check_in else None,
            "check_out": hotel_db.check_out.strftime("%Y-%m-%d") if hotel_db.check_out else None,
            "city": hotel_db.location,
        }

    return {
        "id": itinerary.id,
        "traveler": traveler,
        "segments": segments,
        "hotel": hotel,
    }


def _build_policy_from_db(db: Session, itinerary_id: str) -> dict:
    """Load user travel policy from DB, or use defaults."""
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        return {
            "maximumAdditionalFare": 20000,
            "currency": "INR",
            "maximumStops": 1,
            "minimumConnectionMinutes": 90,
            "autonomousRebooking": True,
            "autonomousHotelModification": True,
        }

    prefs = db.query(TravelPreferences).filter(TravelPreferences.user_id == itinerary.user_id).first()
    if prefs:
        return {
            "maximumAdditionalFare": prefs.max_additional_fare,
            "currency": prefs.currency,
            "maximumStops": 1,
            "minimumConnectionMinutes": prefs.min_connection_minutes,
            "autonomousRebooking": bool(prefs.autonomous_rebooking),
            "autonomousHotelModification": bool(prefs.autonomous_hotel_modification),
        }

    return {
        "maximumAdditionalFare": 20000,
        "currency": "INR",
        "maximumStops": 1,
        "minimumConnectionMinutes": 90,
        "autonomousRebooking": True,
        "autonomousHotelModification": True,
    }


def _build_demo_alternatives(disruption: Disruption) -> list:
    """
    Builds realistic candidate alternatives for the demo/simulation scenario.
    In production these would come from Duffel / Amadeus search.
    Covers all 4 SRS scenario alternatives: 2 compliant, 2 policy-exceeding.
    """
    return [
        {
            "id": "ALT-AI203",
            "airline": "Air India",
            "flight_number": "AI203",
            "origin": "DEL",
            "destination": "LHR",
            "departure_time": "20:30",
            "arrival_time": "05:45",
            "duration_minutes": 555,
            "stops": 1,
            "additional_fare": 8500,
            "currency": "INR",
            "connection_minutes": 135,
            "cabin": "ECONOMY",
        },
        {
            "id": "ALT-BA138",
            "airline": "British Airways",
            "flight_number": "BA138",
            "origin": "BOM",
            "destination": "LHR",
            "departure_time": "23:15",
            "arrival_time": "07:30",
            "duration_minutes": 555,
            "stops": 0,
            "additional_fare": 14200,
            "currency": "INR",
            "connection_minutes": 0,
            "cabin": "ECONOMY",
        },
        {
            "id": "ALT-EK501",
            "airline": "Emirates",
            "flight_number": "EK501",
            "origin": "BOM",
            "destination": "LHR",
            "departure_time": "19:40",
            "arrival_time": "06:15",
            "duration_minutes": 665,
            "stops": 1,
            "additional_fare": 24500,
            "currency": "INR",
            "connection_minutes": 110,
            "cabin": "BUSINESS",
        },
        {
            "id": "ALT-LH761",
            "airline": "Lufthansa",
            "flight_number": "LH761",
            "origin": "DEL",
            "destination": "LHR",
            "departure_time": "01:50",
            "arrival_time": "11:20",
            "duration_minutes": 840,
            "stops": 1,
            "additional_fare": 29000,
            "currency": "INR",
            "connection_minutes": 240,
            "cabin": "ECONOMY",
        },
    ]


# ─── Main AI Analysis Endpoint ─────────────────────────────────────────────

@router.post("", response_model=ApiResponse)
async def run_ai_analysis(payload: AiAnalysisRequest, db: Session = Depends(get_db)):
    """
    Runs the complete 5-layer AI orchestration pipeline for a disruption.

    Layers:
      1. PERCEPTION   — Build structured context from disruption + itinerary data
      2. REASONING    — Score & rank candidate alternatives (FlightEvaluator)
      3. POLICY       — Deterministic policy compliance validation (PolicyEngine)
      4. DECISION     — AI recommendation with confidence score (DecisionAgent / LLM)
      5. VERIFICATION — Guardrail enforcement + anti-hallucination checks (AiGuardrails)

    Returns the complete pipeline result including all layer outputs,
    AI decision, guardrail status, and audit trail.
    """
    pipeline_start = datetime.utcnow()
    logger.info("AI_ANALYSIS  Starting pipeline for disruption=%s", payload.disruption_id)

    # ── Fetch disruption from DB ────────────────────────────────────────────
    disruption = db.query(Disruption).filter(Disruption.id == payload.disruption_id).first()
    if not disruption:
        return ApiResponse(
            success=False,
            error=ApiError(
                code="DISRUPTION_NOT_FOUND",
                message=f"Disruption '{payload.disruption_id}' not found. "
                        f"Trigger a simulation first via POST /api/disruptions/simulate"
            )
        )

    # ── Build itinerary and policy from DB ─────────────────────────────────
    itinerary_id = payload.itinerary_id or disruption.itinerary_id
    itinerary_data = _build_itinerary_payload(db, disruption)
    policy = _build_policy_from_db(db, itinerary_id)

    # ── Build disruption event payload ─────────────────────────────────────
    # Map DB disruption type back to event type for context builder
    event_type_map = {
        "CANCELLATION": "FLIGHT_CANCELLED",
        "DELAY": "FLIGHT_DELAYED",
        "MISSED_CONNECTION": "MISSED_CONNECTION",
        "CONNECTION_RISK": "CONNECTION_RISK",
    }

    # Get the original flight number from the disrupted segment
    disrupted_segment = db.query(TravelSegment).filter(TravelSegment.id == disruption.segment_id).first()
    disrupted_flight_id = "AI101"  # default
    if disrupted_segment and disrupted_segment.flight:
        disrupted_flight_id = disrupted_segment.flight.flight_number

    disruption_event = {
        "disruptionId": disruption.id,
        "eventType": event_type_map.get(disruption.type, "FLIGHT_CANCELLED"),
        "flightId": disrupted_flight_id,
        "itineraryId": itinerary_id,
        "severity": disruption.severity,
        "delayMinutes": 0,
        "timestamp": disruption.detected_at.isoformat() if disruption.detected_at else datetime.utcnow().isoformat(),
        "forcePolicyExceeded": payload.force_policy_exceeded,
    }

    # ── Get candidate alternatives (from DB or demo set) ───────────────────
    from app.repositories.disruption_repository import DisruptionRepository
    repo = DisruptionRepository(db)
    db_alternatives = repo.get_alternatives(payload.disruption_id)

    if db_alternatives:
        raw_alternatives = [
            {
                "id": a.id,
                "airline": a.airline,
                "flight_number": a.flight_number,
                "origin": a.origin,
                "destination": a.destination,
                "departure_time": a.departure_time.strftime("%H:%M") if a.departure_time else "TBD",
                "arrival_time": a.arrival_time.strftime("%H:%M") if a.arrival_time else "TBD",
                "duration_minutes": a.duration_minutes or 0,
                "stops": a.stops or 0,
                "additional_fare": float(a.additional_fare or 0),
                "currency": a.currency or "INR",
                "connection_minutes": None,
                "cabin": "ECONOMY",
            }
            for a in db_alternatives
        ]
    else:
        # Use demo alternatives for the SRS scenario
        raw_alternatives = _build_demo_alternatives(disruption)

    audit_trail: dict = {
        "disruption_id": disruption.id,
        "pipeline_started_at": pipeline_start.isoformat(),
        "ai_mode": "LLM" if (settings.AI_API_KEY and settings.AI_API_KEY.strip()) else "DETERMINISTIC",
        "ai_model": settings.AI_MODEL if settings.AI_API_KEY else "rule-based-fallback",
        "layers": {},
    }

    try:
        # ═══════════════════════════════════════════════════════════════════
        # LAYER 1: PERCEPTION — Context Building
        # ═══════════════════════════════════════════════════════════════════
        logger.info("AI_ANALYSIS  [Layer 1/5] PERCEPTION")
        layer1_start = datetime.utcnow()

        context_builder = ContextBuilder()
        context = context_builder.build_disruption_context(
            disruption_event=disruption_event,
            itinerary=itinerary_data,
            policy=policy,
            candidate_alternatives=raw_alternatives,
        )

        audit_trail["layers"]["perception"] = {
            "status": "COMPLETE",
            "duration_ms": int((datetime.utcnow() - layer1_start).total_seconds() * 1000),
            "disruption_type": disruption.type,
            "disruption_severity": disruption.severity,
            "candidates_found": len(raw_alternatives),
            "affected_segments": len(context.get("affected_segments", [])),
            "downstream_impacts": len(context.get("downstream_impacts", [])),
            "downstream_impact_types": [
                i.get("impact_type") for i in context.get("downstream_impacts", [])
            ],
        }

        # ═══════════════════════════════════════════════════════════════════
        # LAYER 2: REASONING — Candidate Scoring & Ranking (FR-07)
        # ═══════════════════════════════════════════════════════════════════
        logger.info("AI_ANALYSIS  [Layer 2/5] REASONING — scoring %d candidates", len(raw_alternatives))
        layer2_start = datetime.utcnow()

        eval_policy = {**policy}
        if payload.force_policy_exceeded:
            eval_policy["forcePolicyExceeded"] = True

        flight_evaluator = FlightEvaluator()
        scored_alternatives = flight_evaluator.evaluate_alternatives(
            candidates=raw_alternatives,
            policy=eval_policy,
            traveler_preferences=itinerary_data.get("traveler", {}).get("preferences"),
        )
        compliant = flight_evaluator.get_compliant_alternatives(scored_alternatives)

        audit_trail["layers"]["reasoning"] = {
            "status": "COMPLETE",
            "duration_ms": int((datetime.utcnow() - layer2_start).total_seconds() * 1000),
            "total_scored": len(scored_alternatives),
            "compliant_count": len(compliant),
            "rejected_count": len(scored_alternatives) - len(compliant),
            "scoring_weights": flight_evaluator.weights,
            "ranked_alternatives": [
                {
                    "id": a.get("id"),
                    "flight": f"{a.get('airline')} {a.get('flight_number')}",
                    "score": a.get("score"),
                    "compliant": a.get("policy_compliant"),
                    "fare": a.get("additional_fare"),
                    "rejection_reasons": a.get("rejection_reasons", []),
                    "scoring_breakdown": a.get("scoring_breakdown", {}),
                }
                for a in scored_alternatives
            ],
        }

        # ═══════════════════════════════════════════════════════════════════
        # LAYER 3: POLICY — Deterministic Validation (FR-08)
        # ═══════════════════════════════════════════════════════════════════
        logger.info("AI_ANALYSIS  [Layer 3/5] POLICY — validating against travel policy")
        layer3_start = datetime.utcnow()

        policy_for_engine = {
            "max_additional_fare": policy.get("maximumAdditionalFare", 20000),
            "currency": policy.get("currency", "INR"),
            "max_stops": policy.get("maximumStops", 1),
            "min_connection_minutes": policy.get("minimumConnectionMinutes", 90),
            "allowed_cabins": ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"],
            "autonomous_rebooking": policy.get("autonomousRebooking", True),
            "autonomous_hotel_modification": policy.get("autonomousHotelModification", True),
        }
        policy_engine = PolicyEngine(policy_for_engine)
        policy_results = {}
        for alt in scored_alternatives:
            result = policy_engine.validate_alternative(alt)
            policy_results[alt.get("id", "unknown")] = result.to_dict()

        audit_trail["layers"]["policy"] = {
            "status": "COMPLETE",
            "duration_ms": int((datetime.utcnow() - layer3_start).total_seconds() * 1000),
            "policy_limits": {
                "max_additional_fare": policy_for_engine["max_additional_fare"],
                "currency": policy_for_engine["currency"],
                "max_stops": policy_for_engine["max_stops"],
                "min_connection_minutes": policy_for_engine["min_connection_minutes"],
                "autonomous_rebooking": policy_for_engine["autonomous_rebooking"],
            },
            "validation_results": policy_results,
            "compliant_count": sum(1 for r in policy_results.values() if r["compliant"]),
            "rejected_count": sum(1 for r in policy_results.values() if not r["compliant"]),
        }

        # ═══════════════════════════════════════════════════════════════════
        # LAYER 4: DECISION — AI Recommendation (FR-09, FR-10)
        # ═══════════════════════════════════════════════════════════════════
        logger.info("AI_ANALYSIS  [Layer 4/5] DECISION — invoking AI agent")
        layer4_start = datetime.utcnow()

        decision_policy = {**policy}
        if payload.force_policy_exceeded:
            decision_policy["forcePolicyExceeded"] = True

        decision_agent = DecisionAgent(
            api_key=settings.AI_API_KEY or None,
            model=settings.AI_MODEL,
            base_url=settings.AI_BASE_URL or None,
        )
        ai_decision = decision_agent.evaluate(
            candidate_options=scored_alternatives,
            policy=decision_policy,
            context=context,
        )
        decision_dict = ai_decision.model_dump()

        # Find the selected alternative's full details
        selected_alt_details = next(
            (a for a in scored_alternatives if a.get("id") == decision_dict.get("selectedAlternativeId")),
            None,
        )

        audit_trail["layers"]["decision"] = {
            "status": "COMPLETE",
            "duration_ms": int((datetime.utcnow() - layer4_start).total_seconds() * 1000),
            "ai_mode": "LLM" if decision_agent._llm_available else "DETERMINISTIC_FALLBACK",
            "decision": decision_dict["decision"],
            "selected_alternative_id": decision_dict["selectedAlternativeId"],
            "selected_alternative": {
                "airline": selected_alt_details.get("airline") if selected_alt_details else None,
                "flight_number": selected_alt_details.get("flight_number") if selected_alt_details else None,
                "additional_fare": selected_alt_details.get("additional_fare") if selected_alt_details else None,
                "stops": selected_alt_details.get("stops") if selected_alt_details else None,
            } if selected_alt_details else None,
            "confidence": decision_dict["confidence"],
            "requires_approval": decision_dict["requiresApproval"],
            "reason_codes": decision_dict["reasonCodes"],
            "explanation": decision_dict["explanation"],
        }

        # ═══════════════════════════════════════════════════════════════════
        # LAYER 5: VERIFICATION — Guardrails (Section 30)
        # ═══════════════════════════════════════════════════════════════════
        logger.info("AI_ANALYSIS  [Layer 5/5] VERIFICATION — enforcing guardrails")
        layer5_start = datetime.utcnow()

        guardrails = AiGuardrails()
        guarded_decision = guardrails.enforce_guardrails(
            decision_output=decision_dict,
            candidate_alternatives=scored_alternatives,
            policy=policy,
        )
        guardrail_result = guarded_decision.get("guardrail_result", {})

        audit_trail["layers"]["verification"] = {
            "status": "COMPLETE",
            "duration_ms": int((datetime.utcnow() - layer5_start).total_seconds() * 1000),
            "guardrail_passed": guardrail_result.get("passed", False),
            "violations": guardrail_result.get("violations", []),
            "final_decision": guarded_decision.get("decision"),
            "final_requires_approval": guarded_decision.get("requiresApproval", True),
            "overridden": guarded_decision.get("decision") != decision_dict.get("decision"),
        }

        # ── Pipeline complete ───────────────────────────────────────────────
        pipeline_end = datetime.utcnow()
        total_ms = int((pipeline_end - pipeline_start).total_seconds() * 1000)

        logger.info(
            "AI_ANALYSIS  Pipeline complete  disruption=%s  decision=%s  confidence=%.2f  duration=%dms",
            disruption.id,
            guarded_decision.get("decision"),
            decision_dict.get("confidence", 0),
            total_ms,
        )

        response_data = to_camel_case({
            "disruption_id": disruption.id,
            "disruption_type": disruption.type,
            "disruption_severity": disruption.severity,
            "disruption_description": disruption.description,
            "pipeline_status": "SUCCESS",
            "pipeline_duration_ms": total_ms,
            "completed_at": pipeline_end.isoformat(),
            # Final AI decision
            "decision": {
                "action": guarded_decision.get("decision"),
                "selected_alternative_id": guarded_decision.get("selectedAlternativeId"),
                "confidence": guarded_decision.get("confidence"),
                "requires_approval": guarded_decision.get("requiresApproval"),
                "reason_codes": guarded_decision.get("reasonCodes", []),
                "explanation": guarded_decision.get("explanation"),
                "ai_mode": "LLM" if decision_agent._llm_available else "DETERMINISTIC_FALLBACK",
                "ai_model": settings.AI_MODEL if decision_agent._llm_available else "rule-based",
                "guardrail_passed": guardrail_result.get("passed", False),
                "guardrail_violations": guardrail_result.get("violations", []),
            },
            # Selected alternative full details
            "selected_alternative": selected_alt_details,
            # All scored alternatives
            "ranked_alternatives": scored_alternatives,
            # Full audit trail per layer
            "audit_trail": audit_trail,
        })

        return ApiResponse(success=True, data=response_data)

    except Exception as exc:
        logger.error("AI_ANALYSIS  Pipeline FAILED: %s", str(exc), exc_info=True)
        audit_trail["error"] = str(exc)
        return ApiResponse(
            success=False,
            error=ApiError(
                code="PIPELINE_ERROR",
                message=f"AI analysis pipeline failed: {str(exc)}"
            )
        )


@router.get("/status", response_model=ApiResponse)
def get_ai_status():
    """
    Returns the current AI engine configuration and operational status.
    Useful for the frontend to show which AI mode is active.
    """
    has_key = bool(settings.AI_API_KEY and settings.AI_API_KEY.strip())
    return ApiResponse(
        success=True,
        data=to_camel_case({
            "ai_available": has_key,
            "ai_mode": "LLM" if has_key else "DETERMINISTIC_FALLBACK",
            "ai_model": settings.AI_MODEL if has_key else "rule-based-fallback",
            "ai_provider": "OpenRouter" if (has_key and "openrouter" in (settings.AI_BASE_URL or "")) else "Direct",
            "ai_base_url": settings.AI_BASE_URL if has_key else None,
            "guardrails_active": True,
            "policy_engine_active": True,
            "confidence_threshold_auto": 0.70,
            "confidence_threshold_escalate": 0.40,
            "features": {
                "fr_06_alternative_search": True,
                "fr_07_alternative_ranking": True,
                "fr_08_policy_validation": True,
                "fr_09_autonomous_rebooking": True,
                "fr_10_human_approval": True,
                "hallucination_prevention": True,
                "5_layer_pipeline": True,
            },
        })
    )
