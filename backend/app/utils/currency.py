# Owner: Member C
# Currency formatting utilities

SYMBOLS = {
    "INR": "Rs.",
    "USD": "$",
    "GBP": "£",
    "EUR": "€",
}


def format_currency(amount: float, currency: str = "INR") -> str:
    symbol = SYMBOLS.get(currency, currency)
    return f"{symbol}{amount:,.0f}"


def fare_difference(original: float, new: float, currency: str = "INR") -> str:
    diff = new - original
    symbol = SYMBOLS.get(currency, currency)
    if diff > 0:
        return f"+{symbol}{diff:,.0f}"
    elif diff < 0:
        return f"-{symbol}{abs(diff):,.0f}"
    return f"{symbol}0"
