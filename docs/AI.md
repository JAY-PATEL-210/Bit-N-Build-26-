# AI Agent Architecture & Guardrails

## Core Principle
> **AI proposes. Rules validate. APIs execute. System verifies.**

## Multi-Agent Responsibilities
- **Agent Orchestrator**: Manages workflow execution.
- **Context Builder**: Formulates prompts from itinerary, disruption, and policy.
- **Flight Agent**: Ranks alternative flights.
- **Decision Agent**: Produces structured decision JSON with confidence scores and explanation.

## Guardrails
1. No direct execution of bookings or payments.
2. Hallucination protection: AI must never invent flight numbers or fares.
3. Backend validation: PolicyEngine deterministically validates all AI recommendations.
