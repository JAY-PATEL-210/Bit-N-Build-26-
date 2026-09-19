# Scenario 1: Normal -> Cancelled -> Auto-Rebooked
import requests

def run():
    print("Running Scenario 1: Flight Cancellation on AI101...")
    # POST /api/disruptions/simulate with cancellation payload
    res = requests.post("http://localhost:8000/api/disruptions/simulate", json={
        "eventType": "FLIGHT_CANCELLED",
        "flightId": "AI101",
        "itineraryId": "TRIP-001"
    })
    print("Response:", res.json())

if __name__ == "__main__":
    run()
