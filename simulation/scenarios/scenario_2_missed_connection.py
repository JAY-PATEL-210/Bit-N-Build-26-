# Scenario 2: Normal -> Delayed -> Missed Connection Risk
import requests

def run():
    print("Running Scenario 2: Delay causing Missed Connection...")
    res = requests.post("http://localhost:8000/api/disruptions/simulate", json={
        "eventType": "FLIGHT_DELAYED",
        "flightId": "AI101",
        "delayMinutes": 180,
        "itineraryId": "TRIP-001"
    })
    print("Response:", res.json())

if __name__ == "__main__":
    run()
