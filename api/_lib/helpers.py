import json
from http.server import BaseHTTPRequestHandler

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

def ok(data, status=200):
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps(data)}

def err(message, status=400):
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps({"error": message})}

def get_body(request) -> dict:
    try:
        length = int(request.headers.get("Content-Length", 0))
        if length:
            return json.loads(request.rfile.read(length))
    except Exception:
        pass
    return {}
