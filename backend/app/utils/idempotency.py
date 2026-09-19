# Owner: Member C
import uuid


def generate_id(prefix: str = "") -> str:
    """Generate a short unique ID with optional prefix (e.g. 'DIS-A3F9B2')."""
    short = uuid.uuid4().hex[:6].upper()
    return f"{prefix}{short}" if prefix else short


def generate_idempotency_key(prefix: str = "REBOOK") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
