from datetime import datetime

def parse_iso(dt_str: str) -> datetime:
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))

def calculate_minutes_difference(dt1: datetime, dt2: datetime) -> int:
    return int((dt2 - dt1).total_seconds() / 60)
