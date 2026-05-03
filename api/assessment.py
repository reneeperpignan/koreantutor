import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse
import json
from db import get_supabase
from gemini import call_gemini
from cors import add_cors

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._respond(200, None)

    def do_POST(self):
        p = urlparse(self.path).path.rstrip("/")
        if p == "/api/assessment/generate":
            self._generate()
        elif p == "/api/assessment/grade":
            self._grade()
        else:
            self._respond(404, {"error": "Not found"})

    def _generate(self):
        try:
            sb = get_supabase()
            profile = sb.table("profile").select("topik_level").eq("id", 1).single().execute().data
            recent = (
                sb.table("lessons").select("grammar_title")
                .eq("completed", True).order("completed_at", desc=True).limit(5).execute()
            )
            topics = [r["grammar_title"] for r in recent.data] or ["basic Korean grammar"]

            prompt = f"""Generate a comprehensive Korean assessment for TOPIK level {profile['topik_level']}.
Topics: {', '.join(topics)}

Return ONLY valid JSON:
{{
  "title": "Assessment title",
  "questions": [
    {{"type": "translation", "prompt": "Translate into Korean: ...", "answer": "..."}},
    {{"type": "translation", "prompt": "Translate into English: ...", "answer": "..."}},
    {{"type": "fill-in-blank", "prompt": "Fill in: ...", "answer": "..."}},
    {{"type": "grammar-choice", "prompt": "Which is correct? A) ... B) ... C) ...", "answer": "A with explanation"}},
    {{"type": "sentence-correction", "prompt": "Fix the error: ...", "answer": "corrected sentence"}},
    {{"type": "translation", "prompt": "...", "answer": "..."}},
    {{"type": "fill-in-blank", "prompt": "...", "answer": "..."}},
    {{"type": "translation", "prompt": "...", "answer": "..."}},
    {{"type": "grammar-choice", "prompt": "...", "answer": "..."}},
    {{"type": "translation", "prompt": "...", "answer": "..."}}
  ]
}}"""
            self._respond(200, call_gemini(prompt))
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _grade(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            questions = body.get("questions", [])
            answers = body.get("answers", {})

            pairs = [
                {
                    "index": i,
                    "question": q["prompt"],
                    "correct_answer": q["answer"],
                    "student_answer": answers.get(str(i), ""),
                }
                for i, q in enumerate(questions)
            ]
            prompt = f"""Grade these Korean assessment answers. Be fair and accurate.
{json.dumps(pairs, ensure_ascii=False)}

Return ONLY valid JSON:
{{
  "results": [
    {{"index": 0, "correct": true, "feedback": "brief feedback"}},
    ...
  ]
}}"""
            result = call_gemini(prompt)
            self._respond(200, {str(r["index"]): r for r in result.get("results", [])})
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
