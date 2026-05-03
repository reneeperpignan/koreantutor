def add_cors(headers: dict) -> dict:
    """Add CORS headers to a response dict."""
    headers.update({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    })
    return headers
