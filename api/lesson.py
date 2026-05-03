import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse
from datetime import date, timedelta
import json
from db import get_supabase
from gemini import call_gemini
from curriculum import TOPIK_DESCRIPTIONS, TOPIK_GRAMMAR_CURRICULUM
from cors import add_cors

# ── Helpers ───────────────────────────────────────────────────────────────────

def _next_topic(level, covered):
    curriculum = TOPIK_GRAMMAR_CURRICULUM.get(level, [])
    remaining = [t for t in curriculum if t not in covered]
    if not remaining:
        return None  # signals level is complete
    return remaining[0]
    # for t in curriculum:
    #     if t not in covered:
    #         return t
    # return curriculum[-1] if curriculum else "basic Korean grammar"

def _build_prompt(level, topic, recent_grammar, show_roman):
    desc = TOPIK_DESCRIPTIONS.get(level, "beginner")
    roman = (
        "Include romanization in parentheses next to Korean ONLY in vocabulary entries. "
        "Do NOT include romanization in the reading passage or conversation."
    ) if show_roman else "Do NOT include romanization anywhere."
    recent_str = ", ".join(recent_grammar[-5:]) if recent_grammar else "none yet"
    return f"""You are an expert Korean language tutor.
Student level: TOPIK {level} ({desc}).
{roman}

Generate a complete Korean lesson. The NEW grammar focus is: {topic}

The reading passage and conversation must ALSO naturally incorporate recently learned grammar:
{recent_str}
Weave prior grammar into realistic sentences where it fits naturally.

Return ONLY valid JSON, no markdown fences:
{{
  "grammar_title": "short display title",
  "grammar_explanation": "Markdown explanation with meaning, formation, 3-4 example sentences (Korean + English).",
  "vocabulary": [
    {{"korean": "단어", "romanization": "dan-eo", "english": "word", "example": "example sentence"}}
  ],
  "reading_passage": "4-6 sentence Korean passage using new grammar + vocab.",
  "reading_translation": "Full English translation.",
  "conversation": "Realistic 6-8 line dialogue.\\n**A:** Korean — English\\n**B:** Korean — English",
  "exercises": [
    {{"type": "translation", "question": "Translate into Korean: [sentence]", "answer": "correct Korean"}},
    {{"type": "translation", "question": "Translate into English: [Korean]", "answer": "correct English"}},
    {{"type": "fill-in-blank", "question": "Complete: [sentence with ____]", "answer": "answer"}},
    {{"type": "fill-in-blank", "question": "Complete: [sentence with ____]", "answer": "answer"}},
    {{"type": "translation", "question": "Translate into Korean: [sentence]", "answer": "correct Korean"}},
    {{"type": "sentence-building", "question": "Rearrange: [words]", "answer": "correct sentence"}}
  ]
}}
Vocabulary must be 15-20 words relevant to a realistic scenario."""

# ── Handler ───────────────────────────────────────────────────────────────────

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._respond(200, None)

    def do_GET(self):
        p = urlparse(self.path).path.rstrip("/")
        if p == "/api/lesson/today":
            self._today()
        elif p == "/api/lesson/history":
            self._history()
        elif p == "/api/lesson/debug-curriculum":      # ← add this
            self._respond(200, TOPIK_GRAMMAR_CURRICULUM)
        else:
            self._respond(404, {"error": "Not found"})

    def do_POST(self):
        p = urlparse(self.path).path.rstrip("/")
        parts = p.split("/")
        if p == "/api/lesson/generate":
            self._generate()
        elif len(parts) == 5 and parts[-1] == "complete":
            self._complete(int(parts[-2]))
        elif len(parts) == 5 and parts[-1] == "check-exercises":
            self._check_exercises(int(parts[-2]))
        else:
            self._respond(404, {"error": "Not found"})

    # ── Route implementations ─────────────────────────────────────────────────

    def _today(self):
        try:
            sb = get_supabase()
            res = (
                sb.table("lessons")
                .select("*")
                .eq("completed", False)
                .order("created_at", desc=False)
                .limit(1)
                .execute()
            )
            self._respond(200, res.data[0] if res.data else None)
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _generate(self):
        try:
            sb = get_supabase()
            existing = sb.table("lessons").select("id").eq("completed", False).limit(1).execute()
            if existing.data:
                self._respond(400, {"error": "Complete your current lesson first."})
                return

            profile = sb.table("profile").select("*").eq("id", 1).single().execute().data
            level = profile["topik_level"]

            covered_res = sb.table("lessons").select("grammar_topic_key").eq("completed", True).execute()
            covered = [r["grammar_topic_key"] for r in covered_res.data]

            recent_res = (
                sb.table("lessons").select("grammar_title")
                .eq("completed", True).order("completed_at", desc=True).limit(5).execute()
            )
            recent = [r["grammar_title"] for r in recent_res.data]

            topic = _next_topic(level, covered)
            
            if topic is None:
                self._respond(200, {
                    "level_complete": True,
                    "message": f"You've completed all TOPIK {level} grammar topics! Go to your Profile to advance to TOPIK {level + 1}."
                })
                return
            
            lesson_data = call_gemini(_build_prompt(level, topic, recent, profile["show_roman"]))

            row = sb.table("lessons").insert({
                "grammar_title": lesson_data["grammar_title"],
                "grammar_topic_key": topic,
                "topik_level": level,
                "lesson_json": lesson_data,
                "completed": False,
            }).execute()
            self._respond(200, row.data[0])
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _complete(self, lesson_id):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            score = float(body.get("score", 0))
            sb = get_supabase()
            today = date.today()

            sb.table("lessons").update({
                "completed": True,
                "completed_at": today.isoformat(),
                "score": score,
            }).eq("id", lesson_id).execute()

            profile = sb.table("profile").select("*").eq("id", 1).single().execute().data
            last = profile.get("last_completed")
            streak = profile.get("streak", 0)

            if last is None:
                streak = 1
            else:
                last_date = date.fromisoformat(str(last)[:10])
                if last_date == today - timedelta(days=1):
                    streak += 1
                elif last_date == today:
                    pass
                else:
                    streak = 1

            sb.table("profile").update({
                "last_completed": today.isoformat(),
                "streak": streak,
            }).eq("id", 1).execute()
            self._respond(200, {"success": True, "streak": streak})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _check_exercises(self, lesson_id):
        try:
            length = int(self.headers.get("Content-Length", 0))
            answers = json.loads(self.rfile.read(length))

            sb = get_supabase()
            lesson = sb.table("lessons").select("lesson_json").eq("id", lesson_id).single().execute().data
            exercises = lesson["lesson_json"]["exercises"]

            pairs = [
                {
                    "index": i,
                    "question": ex["question"],
                    "correct_answer": ex["answer"],
                    "student_answer": answers.get(str(i), ""),
                }
                for i, ex in enumerate(exercises)
            ]
            prompt = f"""Grade these Korean language exercise answers.
Be lenient with minor differences. Accept grammatically correct Korean alternatives.

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

    def _history(self):
        try:
            sb = get_supabase()
            res = (
                sb.table("lessons")
                .select("id, date, grammar_title, grammar_topic_key, topik_level, score, completed_at")
                .eq("completed", True)
                .order("completed_at", desc=True)
                .execute()
            )
            self._respond(200, res.data)
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

