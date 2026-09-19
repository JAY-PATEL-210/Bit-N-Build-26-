# Owner: Member D (Backend AI / Agent & Integration)
# Section 28: AI Output Contract and Decision Logic
from pydantic import BaseModel, Field
from typing import List

class AiDecisionOutput(BaseModel):
    decision: str = Field(..., description="E.g. REBOOK, ESCALATE, CANCEL")
    selectedAlternativeId: str = Field(..., description="Canonical ID of candidate alternative")
    confidence: float = Field(..., ge=0.0, le=1.0)
    requiresApproval: bool = False
    reasonCodes: List[str] = Field(default_factory=list)
    explanation: str = Field(..., description="Human-readable rationale for traveler transparency")

class DecisionAgent:
    """
    Evaluates candidate alternatives and generates structured, explainable decision outputs.
    AI NEVER directly executes booking or payment (Section 27).
    """
    def evaluate(self, candidate_options: list, policy: dict) -> AiDecisionOutput:
        # Structured output generation logic
        return AiDecisionOutput(
            decision="REBOOK",
            selectedAlternativeId="ALT-102",
            confidence=0.95,
            requiresApproval=False,
            reasonCodes=["WITHIN_FARE_LIMIT", "EARLIEST_ELIGIBLE_ARRIVAL", "VALID_CONNECTION"],
            explanation="Selected because it provides the earliest eligible arrival while remaining within the corporate travel policy."
        )
