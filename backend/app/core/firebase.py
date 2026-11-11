# Firebase Firestore client integration for FastAPI backend
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

BASE_URL = f"https://firestore.googleapis.com/v1/projects/{settings.FIREBASE_PROJECT_ID}/databases/(default)/documents"

def _format_value(val: Any) -> Dict[str, Any]:
    if isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [_format_value(v) for v in val]}}
    elif isinstance(val, dict):
        return {"mapValue": {"fields": {k: _format_value(v) for k, v in val.items()}}}
    return {"stringValue": str(val)}

def _parse_fields(fields: Dict[str, Any]) -> Dict[str, Any]:
    parsed = {}
    for k, v in fields.items():
        if "stringValue" in v:
            parsed[k] = v["stringValue"]
        elif "integerValue" in v:
            parsed[k] = int(v["integerValue"])
        elif "doubleValue" in v:
            parsed[k] = float(v["doubleValue"])
        elif "booleanValue" in v:
            parsed[k] = v["booleanValue"]
        elif "timestampValue" in v:
            parsed[k] = v["timestampValue"]
        elif "arrayValue" in v:
            parsed[k] = [
                next(iter(item.values())) if item else None
                for item in v["arrayValue"].get("values", [])
            ]
        elif "mapValue" in v:
            parsed[k] = _parse_fields(v["mapValue"].get("fields", {}))
    return parsed

def get_firestore_collection(collection_name: str) -> List[Dict[str, Any]]:
    url = f"{BASE_URL}/{collection_name}?key={settings.FIREBASE_API_KEY}"
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                logger.warning("Firestore GET %s error %d: %s", collection_name, resp.status_code, resp.text)
                return []
            docs = resp.json().get("documents", [])
            results = []
            for doc in docs:
                parsed = _parse_fields(doc.get("fields", {}))
                doc_id = doc.get("name", "").split("/")[-1]
                parsed["id"] = parsed.get("id") or doc_id
                results.append(parsed)
            return results
    except Exception as exc:
        logger.error("Firestore connection error: %s", exc)
        return []

def set_firestore_document(collection_name: str, document_id: str, data: Dict[str, Any]) -> bool:
    url = f"{BASE_URL}/{collection_name}/{document_id}?key={settings.FIREBASE_API_KEY}"
    fields = {k: _format_value(v) for k, v in data.items() if v is not None}
    body = {"fields": fields}
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.patch(url, json=body)
            return resp.status_code in (200, 201)
    except Exception as exc:
        logger.error("Firestore write error: %s", exc)
        return False

