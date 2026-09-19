# Owner: Member D (Backend AI / Agent & Integration)
# Section 32: Core Hackathon Demo Scenario 1 (Normal -> Cancelled -> Autonomous Rebook)

"""
Scenario 1:
1. Initial: BOM -> DEL (AI101) -> LHR (AI203) + Hotel in London
2. Event: AI101 Cancelled
3. Disruption Engine: Identifies London connection affected & Hotel affected
4. Candidate search: 4 flights found
5. Policy filter: 2 rejected (exceed ₹20,000 budget), 2 compliant
6. AI Decision Agent: Selects ALT-102 (AI203 direct rebook) with clear explanation
7. Deterministic validation: Policy verified
8. Rebooking: Rebooked with idempotency key
9. Hotel Engine: Check-in adjusted to 11 June
10. Notification & Audit: Traveler notified, audit log saved
"""

def trigger_cancellation_demo():
    print("Triggering Disruption Event: FLIGHT_CANCELLED on AI101...")
    # Calls POST /api/disruptions/simulate
    pass

if __name__ == "__main__":
    trigger_cancellation_demo()
