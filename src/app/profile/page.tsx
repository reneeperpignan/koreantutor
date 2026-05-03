"use client"
import { useEffect, useState } from "react"
import { getProfile, updateProfile } from "@/lib/api"

const GOALS = ["Conversation", "Reading", "Writing", "Business Korean", "TOPIK exam", "K-drama comprehension"]
const FOCUSES = ["Balanced", "Grammar-heavy", "Conversation-heavy", "Reading-heavy"]

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => { getProfile().then(setProfile) }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateProfile({
      name: profile.name,
      topik_level: profile.topik_level,
      goals: profile.goals,
      focus: profile.focus,
      show_roman: profile.show_roman,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">프로필 · Profile</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Name">
          <input
            className="input"
            value={profile.name}
            onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))}
          />
        </Field>

        <Field label="TOPIK Level">
          <select
            className="input"
            value={profile.topik_level}
            onChange={e => setProfile((p: any) => ({ ...p, topik_level: Number(e.target.value) }))}
          >
            {[1,2,3,4,5,6].map(n => (
              <option key={n} value={n}>TOPIK {n} — {["Beginner","Beginner","Intermediate","Intermediate","Advanced","Advanced"][n-1]}</option>
            ))}
          </select>
        </Field>

        <Field label="Learning Goals">
          <div className="flex flex-wrap gap-2">
            {GOALS.map(g => (
              <button
                key={g} type="button"
                onClick={() => setProfile((p: any) => ({
                  ...p,
                  goals: p.goals.includes(g) ? p.goals.filter((x: string) => x !== g) : [...p.goals, g]
                }))}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  profile.goals?.includes(g)
                    ? "bg-[#e94560] text-white border-[#e94560]"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Lesson Focus">
          <select
            className="input"
            value={profile.focus}
            onChange={e => setProfile((p: any) => ({ ...p, focus: e.target.value }))}
          >
            {FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>

        <Field label="Show Romanization">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setProfile((p: any) => ({ ...p, show_roman: !p.show_roman }))}
              className={`w-10 h-6 rounded-full transition-colors ${profile.show_roman ? "bg-[#e94560]" : "bg-gray-300"} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${profile.show_roman ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-600">{profile.show_roman ? "On" : "Off"}</span>
          </label>
        </Field>

        <button
          type="submit"
          className="w-full bg-[#e94560] text-white py-2.5 rounded-xl font-medium"
        >
          {saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: #e94560; }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">{label}</label>
      {children}
    </div>
  )
}
