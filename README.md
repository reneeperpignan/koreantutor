# 한국어 Tutor v3 — Next.js + Python Serverless + Supabase

Everything deploys to a single Vercel project from one GitHub repo.
No separate backend service needed.

## Structure
```
korean_tutor_v3/
├── vercel.json              ← tells Vercel how to build + route
├── requirements.txt         ← Python deps for serverless functions
├── .gitignore
├── api/                     ← Python serverless functions
│   ├── _lib/                ← shared helpers (not exposed as routes)
│   │   ├── db.py
│   │   ├── gemini.py
│   │   ├── curriculum.py
│   │   └── cors.py
│   ├── lesson/
│   │   ├── today.py         GET  /api/lesson/today
│   │   ├── generate.py      POST /api/lesson/generate
│   │   ├── complete.py      POST /api/lesson/complete?id=X&score=Y
│   │   ├── check-exercises.py POST /api/lesson/check-exercises?id=X
│   │   └── history.py       GET  /api/lesson/history
│   ├── profile/
│   │   └── index.py         GET/PATCH /api/profile
│   ├── challenge/
│   │   ├── today.py         GET  /api/challenge/today
│   │   └── check.py         POST /api/challenge/check
│   ├── flashcards/
│   │   ├── index.py         GET  /api/flashcards
│   │   ├── add.py           POST /api/flashcards/add
│   │   ├── result.py        POST /api/flashcards/result
│   │   └── stats.py         GET  /api/flashcards/stats
│   └── assessment/
│       ├── generate.py      POST /api/assessment/generate
│       └── grade.py         POST /api/assessment/grade
└── frontend/                ← Next.js app
```

## Deploy (3 steps)

### 1. Supabase
- Create project at supabase.com
- Run `supabase_schema.sql` in the SQL Editor
- Copy your Project URL and service_role key

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/koreantutor.git
git push -u origin main
```

### 3. Deploy on Vercel
- Import the repo at vercel.com
- Set Root Directory to `.` (the repo root, not frontend/)
- Add these Environment Variables:
  - `GEMINI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
- Click Deploy

Vercel detects Next.js in `frontend/`, builds it, and also deploys
each `api/**/*.py` file as a serverless function automatically.

## Local development
```bash
# Install Vercel CLI
npm i -g vercel

# In project root — runs both Next.js and Python functions locally
vercel dev
```
Add a `.env` file at the root with your three env vars for local dev.

## Notes
- Gemini is ONLY called on explicit button presses — no accidental calls on page load
- All state is in Supabase — refreshes, closes, and redeploys never lose data
- The 10s Vercel free tier function timeout is enough for all calls except
  lesson generation (which can take 5-15s). If it times out, just retry —
  the guard prevents duplicate lesson creation.
