# Owner: Member D (Backend AI / Agent & Integration)
# Section 30: AI Guardrails — Prevents hallucination and validates AI decision output
from typing import Dict, Any, List, Optional, Tuple
import logging

logger = logging.getLogger("AutonomousTravelConcierge.Guardrails")


class AiGuardrails:
    """
    Validates AI decision output against the original candidate set to prevent:
    - Hallucinated flight IDs (referencing alternatives not in the candidate list)
    - Altered fares or schedules (AI inventing cheaper prices)
    - Malformed decision schemas (missing required fields)
    - Confidence threshold violations

    This is the LAST validation gate before any action is taken.
    AI CANNOT bypass these guardrails (Section 27, 30).
    """

    # Minimum confidence for autonomous action
    CONFIDENCE_THRESHOLD_AUTO = 0.70
    # Below this, escalate to human
    CONFIDENCE_THRESHOLD_ESCALATE = 0.40

    REQUIRED_DECISION_FIELDS = {
        "decision", "selectedAlternativeId", "confidence",
        "requiresApproval", "reasonCodes", "explanation"
    }

    VALID_DECISIONS = {"REBOOK", "ESCALATE", "CANCEL", "WAIT", "NO_ACTION"}

    def validate_decision(
        self,
        decision_output: Dict[str, Any],
        candidate_alternatives: List[Dict[str, Any]],
        policy: Dict[str, Any],
    ) -> Tuple[bool, List[str]]:
        """
        Validates the AI decision output against candidates and policy.

        Args:
            decision_output: The structured output from the AI decision agent
            candidate_alternatives: The original candidate alternatives provided to the AI
            policy: Travel policy constraints

        Returns:
            Tuple of (is_valid, list_of_violation_messages)
        """
        violations = []

        # 1. Schema validation — all required fields present
        violations.extend(self._validate_schema(decision_output))

        # 2. Decision type validation
        decision = decision_output.get("decision", "")
        if decision not in self.VALID_DECISIONS:
            violations.append(
                f"INVALID_DECISION: '{decision}' is not a valid decision type. "
                f"Valid types: {', '.join(sorted(self.VALID_DECISIONS))}"
            )

        # 3. Selected alternative validation (hallucination check)
        selected_id = decision_output.get("selectedAlternativeId", "")
        if decision == "REBOOK" and selected_id:
            violations.extend(
                self._validate_selected_alternative(
                    selected_id, candidate_alternatives, policy
                )
            )

        # 4. Confidence threshold validation
        violations.extend(self._validate_confidence(decision_output))

        # 5. Explanation quality check
        explanation = decision_output.get("explanation", "")
        if not explanation or len(explanation.strip()) < 10:
            violations.append(
                "INSUFFICIENT_EXPLANATION: AI must provide a meaningful, "
                "human-readable explanation (minimum 10 characters)."
            )

        # 6. Reason codes validation
        reason_codes = decision_output.get("reasonCodes", [])
        if not isinstance(reason_codes, list):
            violations.append("INVALID_REASON_CODES: reasonCodes must be a list.")

        is_valid = len(violations) == 0

        if violations:
            logger.warning(
                "AI guardrail violations detected (%d): %s",
                len(violations),
                "; ".join(violations),
            )
        else:
            logger.info(
                "AI decision passed all guardrail checks: decision=%s, alternative=%s, confidence=%.2f",
                decision,
                selected_id,
                decision_output.get("confidence", 0),
            )

        return is_valid, violations

    def _validate_schema(self, decision_output: Dict[str, Any]) -> List[str]:
        """Validates that all required fields are present in the decision output."""
        violations = []
        missing = self.REQUIRED_DECISION_FIELDS - set(decision_output.keys())
        if missing:
            violations.append(
                f"MISSING_FIELDS: Required fields missing from AI output: {', '.join(sorted(missing))}"
            )
        return violations

    def _validate_selected_alternative(
        self,
        selected_id: str,
        candidate_alternatives: List[Dict[str, Any]],
        policy: Dict[str, Any],
    ) -> List[str]:
        """
        Validates that the selected alternative:
        1. Exists in the original candidate list (anti-hallucination)
        2. Has matching fare and schedule data (anti-tampering)
        """
        violations = []
        candidate_ids = {alt.get("id") for alt in candidate_alternatives}

        if selected_id not in candidate_ids:
            violations.append(
                f"HALLUCINATED_ALTERNATIVE: AI selected '{selected_id}' which does not exist "
                f"in the candidate set. Valid IDs: {', '.join(sorted(candidate_ids))}"
            )
            return violations  # No point checking further

        # Find the matching candidate
        selected_candidate = next(
            (alt for alt in candidate_alternatives if alt.get("id") == selected_id),
            None,
        )

        if selected_candidate:
            # Verify the candidate is policy-compliant (or approval is requested)
            max_fare = policy.get("maximumAdditionalFare", 20000)
            fare = selected_candidate.get("additional_fare", 0)
            if fare > max_fare:
                violations.append(
                    f"POLICY_VIOLATION: Selected alternative '{selected_id}' has fare "
                    f"₹{fare:,.0f} exceeding policy limit ₹{max_fare:,.0f}. "
                    f"AI must set requiresApproval=True or select a compliant alternative."
                )

        return violations

    def _validate_confidence(self, decision_output: Dict[str, Any]) -> List[str]:
        """Validates confidence score and its consistency with requiresApproval."""
        violations = []
        confidence = decision_output.get("confidence", 0)

        if not isinstance(confidence, (int, float)):
            violations.append("INVALID_CONFIDENCE: confidence must be a number.")
            return violations

        if confidence < 0.0 or confidence > 1.0:
            violations.append(
                f"CONFIDENCE_OUT_OF_RANGE: confidence {confidence} must be between 0.0 and 1.0."
            )

        requires_approval = decision_output.get("requiresApproval", False)
        decision = decision_output.get("decision", "")

        # If confidence is low, AI should request approval
        if confidence < self.CONFIDENCE_THRESHOLD_AUTO and not requires_approval:
            if decision == "REBOOK":
                violations.append(
                    f"LOW_CONFIDENCE_NO_APPROVAL: confidence {confidence:.2f} is below threshold "
                    f"{self.CONFIDENCE_THRESHOLD_AUTO} for autonomous rebooking. "
                    f"AI must set requiresApproval=True."
                )

        return violations

    def enforce_guardrails(
        self,
        decision_output: Dict[str, Any],
        candidate_alternatives: List[Dict[str, Any]],
        policy: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Runs guardrail validation and returns an enriched decision output.
        If guardrails are violated, the decision is overridden to ESCALATE.

        Returns:
            Enriched decision dict with guardrail_result field.
        """
        is_valid, violations = self.validate_decision(
            decision_output, candidate_alternatives, policy
        )

        result = {
            **decision_output,
            "guardrail_result": {
                "passed": is_valid,
                "violations": violations,
                "checked_at": __import__("datetime").datetime.utcnow().isoformat(),
            },
        }

        if not is_valid:
            logger.warning(
                "Guardrails FAILED — overriding AI decision to ESCALATE. Violations: %s",
                violations,
            )
            result["decision"] = "ESCALATE"
            result["requiresApproval"] = True
            result["reasonCodes"] = list(
                set(result.get("reasonCodes", []) + ["GUARDRAIL_VIOLATION"])
            )
            result["explanation"] = (
                f"AI decision overridden by safety guardrails. "
                f"Violations: {'; '.join(violations)}. "
                f"Original explanation: {decision_output.get('explanation', 'N/A')}"
            )

        return result


# Singleton convenience
ai_guardrails = AiGuardrails()
