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

import sys
import os
import asyncio

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from simulation.simulation_engine import run_scenario_1_cancellation


def trigger_cancellation_demo():
    print("=" * 60)
    print("  DEMO SCENARIO 1: Flight Cancellation → Autonomous Rebook")
    print("=" * 60)
    result = asyncio.run(run_scenario_1_cancellation())
    return result


if __name__ == "__main__":
    trigger_cancellation_demo()
