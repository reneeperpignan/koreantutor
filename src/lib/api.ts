// All paths are relative — no NEXT_PUBLIC_API_URL needed.
// Next.js proxies /api/* to Vercel Python functions automatically.

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error ${res.status}`)
  }
  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

// Profile
export const getProfile    = ()           => req("/api/profile")
export const updateProfile = (data: any)  => req("/api/profile", { method: "PATCH", body: JSON.stringify(data) })

// Lessons
export const getTodayLesson   = ()                           => req("/api/lesson/today")
export const generateLesson   = ()                           => req("/api/lesson/generate", { method: "POST" })
export const getLessonHistory = ()                           => req("/api/lesson/history")
export const completeLesson   = (id: number, score: number) =>
  req(`/api/lesson/${id}/complete`, { method: "POST", body: JSON.stringify({ score }) })
export const checkExercises   = (id: number, answers: any)  =>
  req(`/api/lesson/${id}/check-exercises`, { method: "POST", body: JSON.stringify(answers) })

// Flashcards
export const getFlashcards = (params?: { unit?: number; flagged?: boolean }) => {
  const qs = new URLSearchParams()
  if (params?.unit)    qs.set("unit", String(params.unit))
  if (params?.flagged) qs.set("flagged", "true")
  return req(`/api/flashcards/${qs.toString() ? "?" + qs : ""}`)
}
export const addFlashcards    = (words: any[], lesson_id: number, unit: number) =>
  req("/api/flashcards/add", { method: "POST", body: JSON.stringify({ words, lesson_id, unit }) })
export const recordCardResult = (card_id: number, correct: boolean) =>
  req("/api/flashcards/result", { method: "POST", body: JSON.stringify({ card_id, correct }) })
export const getFlashcardStats = () => req("/api/flashcards/stats")

// Daily challenge
export const getTodayChallenge = () => req("/api/challenge/today")
export const checkChallenge    = (data: any) =>
  req("/api/challenge/check", { method: "POST", body: JSON.stringify(data) })

// Assessment
export const generateAssessment = () => req("/api/assessment/generate", { method: "POST" })
export const gradeAssessment    = (data: any) =>
  req("/api/assessment/grade", { method: "POST", body: JSON.stringify(data) })
