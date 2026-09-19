# Scenario 1: Normal -> Cancelled -> Auto-Rebooked
import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


from simulation.simulation_engine import run_scenario_1_cancellation


def run():
    print("Running Scenario 1: Flight Cancellation on AI101...")
    result = asyncio.run(run_scenario_1_cancellation())
    return result


if __name__ == "__main__":
    run()
