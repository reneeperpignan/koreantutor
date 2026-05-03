"use client"
import { useEffect, useState } from "react"
import { getFlashcards, getFlashcardStats, recordCardResult, getProfile } from "@/lib/api"

type Mode = "study" | "list"
type Filter = "all" | "unit" | "struggling"

export default function FlashcardsPage() {
  const [mode, setMode]         = useState<Mode>("study")
  const [filter, setFilter]     = useState<Filter>("all")
  const [unit, setUnit]         = useState(1)
  const [profile, setProfile]   = useState<any>(null)
  const [deck, setDeck]         = useState<any[]>([])
  const [stats, setStats]       = useState<any>(null)
  const [idx, setIdx]           = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal]     = useState(0)
  const [loading, setLoading]   = useState(true)

  async function loadDeck(f: Filter, u: number) {
    setLoading(true)
    const cards = await getFlashcards(
      f === "struggling" ? { flagged: true }
      : f === "unit"    ? { unit: u }
      : {}
    )
    setDeck(cards)
    setIdx(0)
    setRevealed(false)
    setSessionCorrect(0)
    setSessionTotal(0)
    setLoading(false)
  }

  useEffect(() => {
    getProfile().then(p => {
      setProfile(p)
      setUnit(p.current_unit || 1)
    })
    getFlashcardStats().then(setStats)
    loadDeck("all", 1)
  }, [])

  function applyFilter(f: Filter) {
    setFilter(f)
    loadDeck(f, unit)
  }

  async function handleResult(correct: boolean) {
    const card = deck[idx]
    await recordCardResult(card.id, correct)
    setSessionTotal(t => t + 1)
    if (correct) setSessionCorrect(c => c + 1)
    setIdx(i => i + 1)
    setRevealed(false)
  }

  const card = deck[idx]
  const done = idx >= deck.length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">단어 카드 · Flashcards</h1>
        <div className="flex gap-2">
          {(["study", "list"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                mode === m ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {m === "study" ? "🃏 Study" : "📋 List"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Total" value={stats.total} />
          <StatBox label="Mastered" value={stats.mastered} green />
          <StatBox label="Struggling" value={stats.struggling} red />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "unit", "struggling"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => applyFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filter === f ? "bg-[#e94560] text-white border-[#e94560]" : "border-gray-200 text-gray-600"
            }`}
          >
            {f === "all" ? "All words" : f === "unit" ? `Unit ${unit}` : "🔴 Struggling"}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading cards...</p>}
      {!loading && deck.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">🃏</div>
          <p>No cards yet. Complete a lesson and save the vocabulary!</p>
        </div>
      )}

      {/* ── STUDY MODE ── */}
      {!loading && mode === "study" && deck.length > 0 && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#e94560]" style={{ width: `${Math.min(100, idx / deck.length * 100)}%` }} />
            </div>
            <span className="text-xs text-gray-400">{Math.min(idx, deck.length)}/{deck.length}</span>
          </div>

          {done ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-3">
              <div className="text-3xl">🎉</div>
              <p className="font-medium">Session complete!</p>
              <p className="text-gray-500 text-sm">{sessionCorrect}/{sessionTotal} correct</p>
              <button
                onClick={() => loadDeck(filter, unit)}
                className="bg-[#1a1a2e] text-white px-5 py-2 rounded-lg text-sm"
              >
                Study again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Card */}
              <div className="bg-[#1a1a2e] rounded-2xl p-10 text-center border border-[#e94560] min-h-48 flex flex-col justify-center">
                <div className="text-4xl font-bold text-white mb-2">{card.korean}</div>
                {profile?.show_roman && card.romanization && (
                  <div className="text-gray-400 text-sm">{card.romanization}</div>
                )}
              </div>

              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium text-sm"
                >
                  Reveal Answer 👁️
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-lg font-medium">{card.english}</p>
                    <p className="text-xs text-gray-400 mt-1">Unit {card.unit} · Seen {card.times_seen}× · {card.times_seen > 0 ? Math.round(card.times_correct / card.times_seen * 100) : 0}% accuracy</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleResult(true)}  className="bg-green-500 text-white py-3 rounded-xl font-medium">✅ Got it</button>
                    <button onClick={() => handleResult(false)} className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">❌ Still learning</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LIST MODE ── */}
      {!loading && mode === "list" && deck.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[2fr_3fr_1fr_1fr] px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wide">
            <span>한국어</span><span>English</span><span>Seen</span><span>Accuracy</span>
          </div>
          {deck.map((card: any) => (
            <div key={card.id} className="grid grid-cols-[2fr_3fr_1fr_1fr] px-4 py-2.5 border-t border-gray-100 text-sm">
              <span className="font-medium">
                {card.flagged && <span className="text-red-400 mr-1">●</span>}
                {card.korean}
                {profile?.show_roman && card.romanization && (
                  <span className="text-gray-400 font-normal text-xs ml-1">({card.romanization})</span>
                )}
              </span>
              <span className="text-gray-600">{card.english}</span>
              <span className="text-gray-400">{card.times_seen}</span>
              <span className="text-gray-400">
                {card.times_seen > 0 ? `${Math.round(card.times_correct / card.times_seen * 100)}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, green, red }: any) {
  return (
    <div className={`rounded-xl p-3 text-center border ${green ? "border-green-200 bg-green-50" : red ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
      <div className={`text-xl font-bold ${green ? "text-green-600" : red ? "text-red-500" : ""}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
