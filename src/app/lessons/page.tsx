"use client"
import { useEffect, useState } from "react"
import { getTodayLesson, generateLesson, completeLesson, checkExercises, addFlashcards, getProfile, getLessonHistory } from "@/lib/api"
import ReactMarkdown from "react-markdown"

type Tab = "lesson" | "history"

export default function LessonsPage() {
  const [tab, setTab]               = useState<Tab>("lesson")
  const [profile, setProfile]       = useState<any>(null)
  const [lesson, setLesson]         = useState<any>(null)
  const [history, setHistory]       = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const [generating, setGenerating] = useState(false)
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [results, setResults]       = useState<Record<number, any>>({})
  const [checking, setChecking]     = useState(false)
  const [vocabSaved, setVocabSaved] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted]   = useState(false)
  const [score, setScore]           = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getProfile(),
      getTodayLesson(),
      getLessonHistory(),
    ]).then(([p, l, h]) => {
      setProfile(p)
      setLesson(l)
      setHistory(h)
      if (l?.completed) setCompleted(true)
    }).finally(() => setLoading(false))
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const l = await generateLesson()
      setLesson(l)
      setAnswers({})
      setResults({})
      setVocabSaved(false)
      setCompleted(false)
      setScore(null)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleCheckExercises() {
    if (!lesson) return
    setChecking(true)
    try {
      const res = await checkExercises(lesson.id, answers)
      setResults(res)
      const correct = Object.values(res).filter((r: any) => r.correct).length
      const total = lesson.lesson_json.exercises.length
      setScore(Math.round(correct / total * 100))
    } finally {
      setChecking(false)
    }
  }

  async function handleSaveVocab() {
    if (!lesson || !profile) return
    await addFlashcards(lesson.lesson_json.vocabulary, lesson.id, profile.current_unit || 1)
    setVocabSaved(true)
  }

  async function handleComplete() {
    if (!lesson) return
    setCompleting(true)
    try {
      await completeLesson(lesson.id, score ?? 0)
      setCompleted(true)
      // Refresh history
      getLessonHistory().then(setHistory)
    } finally {
      setCompleting(false)
    }
  }

  const lessonData = lesson?.lesson_json

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">수업 · Lessons</h1>
        <div className="flex gap-2">
          {(["lesson", "history"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "lesson" ? "📖 Today" : "📋 History"}
            </button>
          ))}
        </div>
      </div>

      {/* ── TODAY'S LESSON ── */}
      {tab === "lesson" && (
        <div className="space-y-5">
          {loading && <p className="text-gray-400 text-sm">Loading...</p>}

          {/* No lesson yet */}
          {!loading && !lesson && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
              <div className="text-4xl">📖</div>
              <p className="text-gray-600">No lesson in progress. Generate today's lesson to begin.</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-[#e94560] text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Today's Lesson"}
              </button>
            </div>
          )}

          {/* Lesson completed state */}
          {!loading && lesson && completed && (
            <div className="bg-white rounded-xl border border-green-200 p-6 text-center space-y-3">
              <div className="text-3xl">🎉</div>
              <p className="font-medium">Lesson complete! Great work.</p>
              {score !== null && <p className="text-gray-500 text-sm">Exercise score: {score}%</p>}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-[#1a1a2e] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Next Lesson"}
              </button>
            </div>
          )}

          {/* Active lesson */}
          {!loading && lesson && !completed && lessonData && (
            <div className="space-y-5">
              {/* Grammar */}
              <Section title="📐 Grammar Point">
                <h2 className="text-lg font-bold mb-3">{lessonData.grammar_title}</h2>
                <div className="prose-lesson text-sm leading-relaxed">
                  <ReactMarkdown>{lessonData.grammar_explanation}</ReactMarkdown>
                </div>
              </Section>

              {/* Vocab */}
              <Section title={`📚 New Vocabulary (${lessonData.vocabulary?.length ?? 0} words)`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lessonData.vocabulary?.map((w: any, i: number) => (
                    <div key={i} className="bg-gray-50 border-l-4 border-[#e94560] px-3 py-2 rounded text-sm font-mono">
                      <span className="font-bold text-gray-900">{w.korean}</span>
                      {w.romanization && <span className="text-gray-400 ml-1">({w.romanization})</span>}
                      <span className="text-gray-600"> — {w.english}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveVocab}
                  disabled={vocabSaved}
                  className="mt-3 text-sm text-[#e94560] border border-[#e94560] px-4 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {vocabSaved ? "✓ Saved to flashcards" : "➕ Save to flashcards"}
                </button>
              </Section>

              {/* Reading */}
              <Section title="📖 Reading Passage">
                <p className="text-base leading-relaxed whitespace-pre-line">{lessonData.reading_passage}</p>
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Show translation</summary>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{lessonData.reading_translation}</p>
                </details>
              </Section>

              {/* Conversation */}
              <Section title="💬 Sample Conversation">
                <div className="text-sm leading-relaxed whitespace-pre-line prose-lesson">
                  <ReactMarkdown>{lessonData.conversation}</ReactMarkdown>
                </div>
              </Section>

              {/* Exercises */}
              <Section title="✏️ Practice Exercises">
                <div className="space-y-4">
                  {lessonData.exercises?.map((ex: any, i: number) => (
                    <div key={i}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{ex.type}</p>
                      <p className="text-sm mb-2">{ex.question}</p>
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e94560]"
                        placeholder="Your answer..."
                        value={answers[i] ?? ""}
                        onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                      />
                      {results[i] && (
                        <p className={`text-xs mt-1 ${results[i].correct ? "text-green-600" : "text-red-500"}`}>
                          {results[i].correct ? "✅" : "❌"} {results[i].feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCheckExercises}
                  disabled={checking}
                  className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {checking ? "Checking..." : "Check Answers"}
                </button>
              </Section>

              {/* Complete */}
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full bg-[#e94560] text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {completing ? "Saving..." : "✅ Mark Lesson Complete"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No completed lessons yet.</p>
          )}
          {history.map((l: any) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{l.grammar_title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  TOPIK {l.topik_level} · {l.completed_at?.slice(0, 10) ?? l.date}
                </p>
              </div>
              {l.score !== null && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  l.score >= 80 ? "bg-green-100 text-green-700"
                  : l.score >= 50 ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-600"
                }`}>
                  {Math.round(l.score)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}
