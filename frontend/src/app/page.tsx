"use client"
import { useEffect, useState } from "react"
import { getProfile, getTodayChallenge, checkChallenge } from "@/lib/api"
import ReactMarkdown from "react-markdown"
import Link from "next/link"

export default function HomePage() {
  const [profile, setProfile]         = useState<any>(null)
  const [challenge, setChallenge]     = useState<any>(null)
  const [answer, setAnswer]           = useState("")
  const [result, setResult]           = useState<any>(null)
  const [loading, setLoading]         = useState(false)
  const [submitted, setSubmitted]     = useState(false)

  useEffect(() => {
    getProfile().then(setProfile)
    getTodayChallenge().then(ch => {
      setChallenge(ch)
      if (ch?.result_json) {
        setResult(ch.result_json)
        setSubmitted(true)
        setAnswer(ch.user_answer || "")
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || !challenge || !profile) return
    setLoading(true)
    try {
      const res = await checkChallenge({
        sentence: challenge.sentence,
        user_answer: answer,
        topik_level: profile.topik_level,
        show_roman: profile.show_roman,
      })
      setResult(res)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const streak       = profile?.streak ?? 0
  const daysLeft     = profile?.days_remaining ?? 28
  const lessonsCount = profile?.lessons_completed ?? 0
  const progressPct  = Math.min(100, Math.round((28 - daysLeft) / 28 * 100))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          안녕하세요{profile?.name ? `, ${profile.name}` : ""}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          TOPIK {profile?.topik_level ?? "—"} · Let's study Korean
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="🔥 Streak" value={`${streak} days`} />
        <StatCard label="📚 Lessons" value={String(lessonsCount)} />
        <StatCard label="📅 Days left" value={String(daysLeft)} accent />
      </div>

      {/* 28-day progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>28-day challenge</span>
          <span>{28 - daysLeft}/28 days</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e94560] rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Daily challenge */}
      <section className="rounded-xl overflow-hidden border border-[#e94560]">
        <div className="bg-[#1a1a2e] px-5 py-4">
          <p className="text-[#e94560] text-xs font-bold uppercase tracking-widest mb-1">
            🎯 Daily Challenge
          </p>
          <p className="text-white text-lg font-medium">
            {challenge?.sentence ?? "Loading..."}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e94560]"
                placeholder="한국어로 번역하세요..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !answer.trim()}
                className="bg-[#e94560] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? "..." : "Submit"}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className={`text-sm font-medium ${result?.correct ? "text-green-600" : "text-amber-600"}`}>
                {result?.correct ? "✅ Correct!" : "💬 Good try!"}
              </div>
              <p className="text-sm text-gray-700">{result?.feedback}</p>
              {result?.model_answer && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <span className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Model answer</span>
                  {result.model_answer}
                </div>
              )}
              {result?.alternatives?.length > 0 && (
                <div className="text-sm space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide block">Native alternatives</span>
                  {result.alternatives.map((a: string, i: number) => (
                    <p key={i} className="text-gray-700">• {a}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/lessons" className="block bg-[#1a1a2e] text-white rounded-xl p-4 hover:bg-[#16213e] transition-colors">
          <div className="text-2xl mb-1">📖</div>
          <div className="font-medium">Today's Lesson</div>
          <div className="text-gray-400 text-xs mt-1">Continue learning</div>
        </Link>
        <Link href="/flashcards" className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#e94560] transition-colors">
          <div className="text-2xl mb-1">🃏</div>
          <div className="font-medium">Flashcards</div>
          <div className="text-gray-400 text-xs mt-1">Review vocab</div>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${accent ? "bg-[#1a1a2e] text-white" : "bg-white border border-gray-200"}`}>
      <div className={`text-xl font-bold ${accent ? "text-[#e94560]" : ""}`}>{value}</div>
      <div className={`text-xs mt-0.5 ${accent ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
    </div>
  )
}
