# Owner: Member C (Backend Lead / Core Services)
# snake_case → camelCase conversion for API response serialization


def _to_camel(snake_str: str) -> str:
    """Convert a snake_case string to camelCase."""
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


def to_camel_case(data):
    """
    Recursively convert all dict keys from snake_case to camelCase.
    Works on nested dicts, lists of dicts, and mixed structures.
    """
    if isinstance(data, dict):
        return {_to_camel(k): to_camel_case(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [to_camel_case(item) for item in data]
    return data
