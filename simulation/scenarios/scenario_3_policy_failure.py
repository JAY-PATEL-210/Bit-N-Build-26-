# Scenario 3: Disruption where only non-policy alternatives exist -> Triggers Human Escalation
import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


from simulation.simulation_engine import run_scenario_4_policy_failure


def run():
    print("Running Scenario 3: Disruption requiring Human Escalation (Policy Budget Exceeded)...")
    result = asyncio.run(run_scenario_4_policy_failure())
    return result


if __name__ == "__main__":
    run()
