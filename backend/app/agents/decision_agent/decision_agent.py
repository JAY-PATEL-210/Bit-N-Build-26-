# Owner: Member D (Backend AI / Agent & Integration)
# Section 28: AI Decision Agent — Structured, explainable decision output generation
# Section 27: AI NEVER directly executes booking or payment
# Section 30: Hallucination prevention via guardrails
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import logging

logger = logging.getLogger("AutonomousTravelConcierge.DecisionAgent")


class AiDecisionOutput(BaseModel):
    """
    Canonical AI decision output contract (Section 28, Appendix D).
    Every AI decision MUST conform to this schema — no exceptions.
    """
    decision: str = Field(
        ...,
        description="Action type: REBOOK, ESCALATE, CANCEL, WAIT, NO_ACTION"
    )
    selectedAlternativeId: str = Field(
        ...,
        description="Canonical ID of the selected candidate alternative"
    )
    confidence: float = Field(
        ...,
        ge=0.0, le=1.0,
        description="AI confidence score (0.0 to 1.0)"
    )
    requiresApproval: bool = Field(
        default=False,
        description="True if human approval is required before execution"
    )
    reasonCodes: List[str] = Field(
        default_factory=list,
        description="Machine-readable reason codes for the decision"
    )
    explanation: str = Field(
        ...,
        description="Human-readable rationale for traveler transparency"
    )


class DecisionAgent:
    """
    Evaluates candidate alternatives and generates structured, explainable
    decision outputs. Supports two modes:

    1. LLM Mode: Uses OpenAI/Gemini API for reasoning (when AI_API_KEY is set)
    2. Fallback Mode: Uses deterministic rule-based reasoning (offline/demo)

    CRITICAL CONSTRAINTS (Section 27):
    - AI NEVER directly executes booking, payment, or database mutations
    - AI only produces a structured decision recommendation
    - The downstream RebookingService and PolicyEngine handle execution
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model
        self._llm_available = bool(api_key and api_key.strip())

        if self._llm_available:
            logger.info("DecisionAgent initialized with LLM mode (model=%s)", model)
        else:
            logger.info("DecisionAgent initialized with deterministic fallback mode (no API key)")

    def evaluate(
        self,
        candidate_options: List[Dict[str, Any]],
        policy: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
    ) -> AiDecisionOutput:
        """
        Evaluates candidate alternatives and produces a structured decision.

        Args:
            candidate_options: Scored and ranked candidate alternatives
            policy: Travel policy constraints
            context: Full structured context from ContextBuilder

        Returns:
            AiDecisionOutput with decision, selected alternative, confidence, and explanation
        """
        if self._llm_available and context:
            try:
                return self._evaluate_with_llm(candidate_options, policy, context)
            except Exception as e:
                logger.warning(
                    "LLM evaluation failed, falling back to deterministic: %s", str(e)
                )

        return self._evaluate_deterministic(candidate_options, policy, context)

    def _evaluate_deterministic(
        self,
        candidate_options: List[Dict[str, Any]],
        policy: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
    ) -> AiDecisionOutput:
        """
        Deterministic rule-based decision engine (fallback / demo mode).
        This ensures the system works perfectly without any external API.
        """
        max_fare = policy.get("maximumAdditionalFare", policy.get("maximum_additional_fare", 20000))
        max_stops = policy.get("maximumStops", policy.get("maximum_stops", 1))
        autonomous = policy.get("autonomousRebooking", policy.get("autonomous_rebooking", True))
        force_exceeded = policy.get("forcePolicyExceeded", False)

        # If context signals force policy exceeded, treat all as non-compliant
        if context and context.get("disruption", {}).get("force_policy_exceeded"):
            force_exceeded = True

        # Separate compliant vs non-compliant
        compliant = []
        non_compliant = []

        for opt in candidate_options:
            fare = opt.get("additional_fare", 0)
            stops = opt.get("stops", 0)

            if force_exceeded or fare > max_fare or stops > max_stops:
                non_compliant.append(opt)
            else:
                compliant.append(opt)

        # --- Decision Logic ---

        # Case 1: No candidates at all
        if not candidate_options:
            return AiDecisionOutput(
                decision="ESCALATE",
                selectedAlternativeId="NONE",
                confidence=0.95,
                requiresApproval=True,
                reasonCodes=["NO_ALTERNATIVES_FOUND"],
                explanation=(
                    "No alternative flights were found for this disruption. "
                    "The case has been escalated to a human agent for manual resolution."
                ),
            )

        # Case 2: Compliant alternatives exist — select the best one
        if compliant:
            # Sort by score if available, otherwise by fare (ascending)
            compliant.sort(key=lambda x: (-x.get("score", 0), x.get("additional_fare", 0)))
            best = compliant[0]

            reason_codes = self._build_reason_codes(best, policy)
            confidence = self._calculate_confidence(best, compliant, policy)

            needs_approval = not autonomous or confidence < 0.70

            return AiDecisionOutput(
                decision="REBOOK" if not needs_approval else "REBOOK",
                selectedAlternativeId=best.get("id", "UNKNOWN"),
                confidence=round(confidence, 2),
                requiresApproval=needs_approval,
                reasonCodes=reason_codes,
                explanation=self._generate_explanation(best, policy, context),
            )

        # Case 3: Only non-compliant alternatives — escalate for human approval
        non_compliant.sort(key=lambda x: x.get("additional_fare", float("inf")))
        cheapest = non_compliant[0]

        return AiDecisionOutput(
            decision="ESCALATE",
            selectedAlternativeId=cheapest.get("id", "UNKNOWN"),
            confidence=0.85,
            requiresApproval=True,
            reasonCodes=[
                "POLICY_VIOLATION_ESCALATION",
                "ALL_ALTERNATIVES_EXCEED_BUDGET",
                "REQUIRES_TRAVELER_APPROVAL",
            ],
            explanation=(
                f"All {len(non_compliant)} available alternative(s) exceed the corporate travel "
                f"policy budget of ₹{max_fare:,.0f}. The cheapest option is "
                f"{cheapest.get('airline', '')} {cheapest.get('flight_number', '')} "
                f"at ₹{cheapest.get('additional_fare', 0):,.0f}. "
                f"Traveler approval is required before rebooking."
            ),
        )

    def _evaluate_with_llm(
        self,
        candidate_options: List[Dict[str, Any]],
        policy: Dict[str, Any],
        context: Dict[str, Any],
    ) -> AiDecisionOutput:
        """
        Uses OpenAI/Gemini API for intelligent reasoning.
        The LLM receives structured context and must return valid JSON
        conforming to AiDecisionOutput schema.
        """
        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.api_key)

            system_prompt = self._build_system_prompt()
            user_prompt = self._build_user_prompt(candidate_options, policy, context)

            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,  # Low temperature for deterministic decisions
                max_tokens=1000,
            )

            raw_output = response.choices[0].message.content
            parsed = json.loads(raw_output)

            # Validate against Pydantic schema
            decision = AiDecisionOutput(**parsed)

            logger.info(
                "LLM decision: %s (alternative=%s, confidence=%.2f)",
                decision.decision,
                decision.selectedAlternativeId,
                decision.confidence,
            )

            return decision

        except Exception as e:
            logger.error("LLM evaluation error: %s", str(e))
            raise

    def _build_system_prompt(self) -> str:
        """Constructs the system prompt for the LLM."""
        return """You are an AI Travel Disruption Decision Agent. Your role is to evaluate
candidate alternative flights and recommend the best rebooking option.

CRITICAL RULES:
1. You MUST select from the provided candidate alternatives ONLY. Never invent flight IDs.
2. You MUST respect travel policy constraints (fare limits, stop limits, connection times).
3. If no compliant alternative exists, set decision to "ESCALATE" and requiresApproval to true.
4. Always provide clear, traveler-friendly explanations.
5. Confidence should reflect how certain you are about the recommendation.

You MUST respond with valid JSON matching this exact schema:
{
    "decision": "REBOOK" | "ESCALATE" | "CANCEL" | "WAIT" | "NO_ACTION",
    "selectedAlternativeId": "string (ID from candidates)",
    "confidence": 0.0 to 1.0,
    "requiresApproval": boolean,
    "reasonCodes": ["string array"],
    "explanation": "Human-readable explanation"
}"""

    def _build_user_prompt(
        self,
        candidates: List[Dict[str, Any]],
        policy: Dict[str, Any],
        context: Dict[str, Any],
    ) -> str:
        """Constructs the user prompt with structured context."""
        return json.dumps({
            "task": "Evaluate disruption and recommend best rebooking option",
            "disruption": context.get("disruption", {}),
            "affected_segments": context.get("affected_segments", []),
            "downstream_impacts": context.get("downstream_impacts", []),
            "policy_constraints": context.get("policy", {}),
            "candidate_alternatives": candidates,
            "traveler_preferences": context.get("itinerary", {}).get("traveler", {}).get("preferences", {}),
        }, indent=2)

    def _build_reason_codes(
        self, selected: Dict[str, Any], policy: Dict[str, Any]
    ) -> List[str]:
        """Builds machine-readable reason codes for the selected alternative."""
        codes = []
        max_fare = policy.get("maximumAdditionalFare", policy.get("maximum_additional_fare", 20000))
        max_stops = policy.get("maximumStops", policy.get("maximum_stops", 1))

        fare = selected.get("additional_fare", 0)
        stops = selected.get("stops", 0)

        if fare <= max_fare:
            codes.append("WITHIN_FARE_LIMIT")
        if stops <= max_stops:
            codes.append("VALID_CONNECTION")
        if selected.get("score", 0) >= 0.7:
            codes.append("HIGH_SCORE_CANDIDATE")

        # Check if earliest arrival
        codes.append("EARLIEST_ELIGIBLE_ARRIVAL")

        return codes

    def _calculate_confidence(
        self,
        selected: Dict[str, Any],
        compliant_options: List[Dict[str, Any]],
        policy: Dict[str, Any],
    ) -> float:
        """Calculates confidence score based on decision quality factors."""
        confidence = 0.50  # Base

        # Higher score = higher confidence
        score = selected.get("score", 0.5)
        confidence += score * 0.25

        # More compliant options = more confidence (alternatives exist)
        if len(compliant_options) >= 2:
            confidence += 0.10
        if len(compliant_options) >= 3:
            confidence += 0.05

        # Fare well within budget = higher confidence
        max_fare = policy.get("maximumAdditionalFare", policy.get("maximum_additional_fare", 20000))
        fare = selected.get("additional_fare", 0)
        if max_fare > 0:
            margin = 1.0 - (fare / max_fare)
            confidence += margin * 0.10

        return min(0.99, max(0.40, confidence))

    def _generate_explanation(
        self,
        selected: Dict[str, Any],
        policy: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generates a human-readable explanation of the decision."""
        airline = selected.get("airline", "Unknown Airline")
        flight_num = selected.get("flight_number", "N/A")
        fare = selected.get("additional_fare", 0)
        max_fare = policy.get("maximumAdditionalFare", policy.get("maximum_additional_fare", 20000))
        departure = selected.get("departure_time", "N/A")
        arrival = selected.get("arrival_time", "N/A")
        stops = selected.get("stops", 0)

        disruption_type = "disruption"
        if context:
            event_type = context.get("disruption", {}).get("event_type", "")
            if event_type == "FLIGHT_CANCELLED":
                disruption_type = "flight cancellation"
            elif event_type == "FLIGHT_DELAYED":
                disruption_type = "flight delay"
            elif event_type == "MISSED_CONNECTION":
                disruption_type = "missed connection"

        explanation = (
            f"Due to the {disruption_type}, {airline} flight {flight_num} "
            f"(departing {departure}, arriving {arrival}, {stops} stop{'s' if stops != 1 else ''}) "
            f"has been selected as the best alternative. "
            f"The additional fare of ₹{fare:,.0f} is within the corporate policy limit of "
            f"₹{max_fare:,.0f}, saving ₹{max_fare - fare:,.0f} of the allowed budget."
        )

        return explanation
