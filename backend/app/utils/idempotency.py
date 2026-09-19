import uuid

def generate_idempotency_key(prefix: str = "REBOOK") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
