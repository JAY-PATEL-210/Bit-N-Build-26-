# Scenario 3: Disruption where only non-policy alternatives exist -> Triggers Human Escalation
import requests

def run():
    print("Running Scenario 3: Disruption requiring Human Escalation (Policy Budget Exceeded)...")
    res = requests.post("http://localhost:8000/api/disruptions/simulate", json={
        "eventType": "FLIGHT_CANCELLED",
        "flightId": "AI101",
        "itineraryId": "TRIP-001",
        "forcePolicyExceeded": True
    })
    print("Response:", res.json())

if __name__ == "__main__":
    run()
