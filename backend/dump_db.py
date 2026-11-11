import json
import httpx

FIREBASE_PROJECT_ID = "pankti-56227"
FIREBASE_API_KEY = "AIzaSyBiVJD488-syt7E2l0KkYBSmGEsR1Xl7XU"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents"

def get_collection(name: str):
    url = f"{BASE_URL}/{name}?key={FIREBASE_API_KEY}"
    res = httpx.get(url)
    if res.status_code != 200:
        return []
    docs = res.json().get("documents", [])
    results = []
    for doc in docs:
        fields = doc.get("fields", {})
        cleaned = {}
        for k, v in fields.items():
            for val_type in ("stringValue", "integerValue", "doubleValue", "booleanValue", "timestampValue"):
                if val_type in v:
                    cleaned[k] = v[val_type]
                    break
        results.append(cleaned)
    return results

data = {
    "users": get_collection("users"),
    "travel_preferences": get_collection("travel_preferences"),
    "itineraries": get_collection("itineraries"),
    "flights": get_collection("flights"),
    "hotel_bookings": get_collection("hotel_bookings"),
}

print(json.dumps(data, indent=2))
