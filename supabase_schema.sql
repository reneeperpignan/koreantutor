-- ============================================================
-- Korean Tutor Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Profile / progress
CREATE TABLE IF NOT EXISTS profile (
  id            SERIAL PRIMARY KEY,
  name          TEXT DEFAULT 'Learner',
  topik_level   INT DEFAULT 1,
  goals         TEXT[] DEFAULT ARRAY['Conversation'],
  focus         TEXT DEFAULT 'Balanced',
  show_roman    BOOLEAN DEFAULT TRUE,
  streak        INT DEFAULT 0,
  last_completed DATE,
  start_date    DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default profile row (single-user app)
INSERT INTO profile (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Completed lessons (one row per finished lesson)
CREATE TABLE IF NOT EXISTS lessons (
  id               SERIAL PRIMARY KEY,
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  grammar_title    TEXT NOT NULL,
  grammar_topic_key TEXT NOT NULL,
  topik_level      INT NOT NULL,
  lesson_json      JSONB NOT NULL,   -- full generated lesson stored here
  completed        BOOLEAN DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  score            REAL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id            SERIAL PRIMARY KEY,
  korean        TEXT NOT NULL UNIQUE,
  romanization  TEXT,
  english       TEXT NOT NULL,
  unit          INT DEFAULT 1,
  lesson_id     INT REFERENCES lessons(id),
  times_seen    INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  last_seen     DATE,
  flagged       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Daily challenge results (cache so Gemini isn't re-called)
CREATE TABLE IF NOT EXISTS daily_challenges (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  sentence    TEXT NOT NULL,
  user_answer TEXT,
  result_json JSONB,
  completed   BOOLEAN DEFAULT FALSE
);
