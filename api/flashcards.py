import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import date
import json
from db import get_supabase
from cors import add_cors

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._respond(200, None)

    def do_GET(self):
        p = urlparse(self.path).path.rstrip("/")
        if p == "/api/flashcards":
            self._list()
        elif p == "/api/flashcards/stats":
            self._stats()
        else:
            self._respond(404, {"error": "Not found"})

    def do_POST(self):
        p = urlparse(self.path).path.rstrip("/")
        if p == "/api/flashcards/add":
            self._add()
        elif p == "/api/flashcards/result":
            self._result()
        else:
            self._respond(404, {"error": "Not found"})

    def _list(self):
        try:
            qs = parse_qs(urlparse(self.path).query)
            unit = qs.get("unit", [None])[0]
            flagged = qs.get("flagged", ["false"])[0] == "true"
            sb = get_supabase()
            query = sb.table("flashcards").select("*")
            if flagged:
                query = query.eq("flagged", True)
            elif unit:
                query = query.eq("unit", int(unit))
            res = query.order("times_correct", desc=False).execute()
            self._respond(200, res.data)
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _stats(self):
        try:
            cards = get_supabase().table("flashcards").select("times_seen, times_correct, flagged").execute().data
            total = len(cards)
            struggling = sum(1 for c in cards if c["flagged"])
            mastered = sum(1 for c in cards if c["times_seen"] > 0 and c["times_correct"] / c["times_seen"] >= 0.8)
            self._respond(200, {"total": total, "struggling": struggling, "mastered": mastered})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _add(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            words = body.get("words", [])
            lesson_id = body.get("lesson_id")
            unit = body.get("unit", 1)
            sb = get_supabase()
            added = 0
            for word in words:
                existing = sb.table("flashcards").select("id").eq("korean", word["korean"]).execute()
                if not existing.data:
                    sb.table("flashcards").insert({
                        "korean": word["korean"],
                        "romanization": word.get("romanization", ""),
                        "english": word["english"],
                        "unit": unit,
                        "lesson_id": lesson_id,
                    }).execute()
                    added += 1
            self._respond(200, {"added": added})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _result(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            card_id = body["card_id"]
            correct = body["correct"]
            sb = get_supabase()
            card = sb.table("flashcards").select("*").eq("id", card_id).single().execute().data
            sb.table("flashcards").update({
                "times_seen": card["times_seen"] + 1,
                "times_correct": card["times_correct"] + (1 if correct else 0),
                "last_seen": date.today().isoformat(),
                "flagged": not correct,
            }).eq("id", card_id).execute()
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
