import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

from http.server import BaseHTTPRequestHandler
from datetime import date
import json
from db import get_supabase
from cors import add_cors

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._respond(200, None)

    def do_GET(self):
        try:
            sb = get_supabase()
            profile = sb.table("profile").select("*").eq("id", 1).single().execute().data
            start = profile.get("start_date")
            if start:
                start_date = date.fromisoformat(str(start)[:10])
                days_remaining = max(0, 28 - (date.today() - start_date).days)
            else:
                days_remaining = 28
            count_res = sb.table("lessons").select("id", count="exact").eq("completed", True).execute()
            profile["days_remaining"] = days_remaining
            profile["lessons_completed"] = count_res.count or 0
            self._respond(200, profile)
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def do_PATCH(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            allowed = {"name", "topik_level", "goals", "focus", "show_roman"}
            update = {k: v for k, v in body.items() if k in allowed}
            get_supabase().table("profile").update(update).eq("id", 1).execute()
            self._respond(200, {"success": True})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _respond(self, status, data):
        body = json.dumps(data, default=str).encode() if data is not None else b"null"
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        for k, v in add_cors({}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)
