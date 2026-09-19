# Simulation Engine & Demo Scenarios

This directory provides simulated flight events and mock booking responses designed for live hackathon judge demonstrations.

## Events
- `events/cancellation.json`: Immediate cancellation of flight AI101.
- `events/delay.json`: 3-hour delay causing connection feasibility breach.
- `events/missed_connection.json`: Detected missed connection event.
- `events/booking_failure.json`: Transient booking failure testing recovery/escalation.

## Demo Scenarios
1. `scenarios/scenario_1_cancellation.py`: Full end-to-end autonomous rebooking with policy compliance.
2. `scenarios/scenario_2_missed_connection.py`: Upstream delay leading to connection re-routing.
3. `scenarios/scenario_3_policy_failure.py`: High-fare alternative requiring traveler approval.
