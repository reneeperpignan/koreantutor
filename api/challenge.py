import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse
from datetime import date
import json, hashlib
from db import get_supabase
from gemini import call_gemini
from curriculum import DAILY_CHALLENGE_SENTENCES
from cors import add_cors

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._respond(200, None)

    def do_GET(self):
        p = urlparse(self.path).path.rstrip("/")
        if p == "/api/challenge/today":
            self._today()
        else:
            self._respond(404, {"error": "Not found"})

    def do_POST(self):
        p = urlparse(self.path).path.rstrip("/")
        if p == "/api/challenge/check":
            self._check()
        else:
            self._respond(404, {"error": "Not found"})

    def _today(self):
        try:
            sb = get_supabase()
            today = date.today().isoformat()
            existing = sb.table("daily_challenges").select("*").eq("date", today).execute()
            if existing.data:
                self._respond(200, existing.data[0])
                return

            profile = sb.table("profile").select("topik_level").eq("id", 1).single().execute().data
            level = profile["topik_level"]
            sentences = DAILY_CHALLENGE_SENTENCES.get(level, DAILY_CHALLENGE_SENTENCES[1])
            idx = int(hashlib.md5(today.encode()).hexdigest(), 16) % len(sentences)

            row = sb.table("daily_challenges").insert({
                "date": today,
                "sentence": sentences[idx],
            }).execute()
            self._respond(200, row.data[0])
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _check(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            sentence = body["sentence"]
            user_answer = body["user_answer"]
            level = body.get("topik_level", 1)
            show_roman = body.get("show_roman", True)

            roman = "Include romanization next to Korean" if show_roman else ""
            prompt = f"""A TOPIK level {level} Korean student translated this English sentence:
"{sentence}"
Their answer: "{user_answer}"

Return ONLY valid JSON:
{{
  "correct": true or false,
  "feedback": "1-2 sentences of specific feedback",
  "model_answer": "most natural Korean translation",
  "alternatives": ["alternative 1 with English", "alternative 2", "casual version"]
}}
{roman}. Be encouraging but accurate."""

            result = call_gemini(prompt)
            today = date.today().isoformat()
            get_supabase().table("daily_challenges").update({
                "user_answer": user_answer,
                "result_json": result,
                "completed": True,
            }).eq("date", today).execute()
            self._respond(200, result)
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
