# Owner: Member C
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def parse_iso(dt_str: str) -> datetime:
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))


def minutes_between(dt1: datetime, dt2: datetime) -> int:
    """Positive if dt2 is after dt1."""
    return int((dt2 - dt1).total_seconds() / 60)


def format_datetime(dt: datetime) -> str:
    return dt.strftime("%d %b %Y, %H:%M")
