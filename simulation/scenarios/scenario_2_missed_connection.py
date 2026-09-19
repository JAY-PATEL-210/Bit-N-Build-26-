# Scenario 2: Normal -> Delayed -> Missed Connection Risk
import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from simulation.simulation_engine import run_scenario_2_missed_connection


def run():
    print("Running Scenario 2: Delay causing Missed Connection...")
    result = asyncio.run(run_scenario_2_missed_connection())
    return result


if __name__ == "__main__":
    run()
