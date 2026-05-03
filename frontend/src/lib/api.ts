// Same-origin — no base URL needed since API and frontend are on the same Vercel deployment
async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.detail || `API error ${res.status}`)
  }
  return res.json()
}

// Profile
export const getProfile    = ()           => req("/api/profile")
export const updateProfile = (data: any)  => req("/api/profile", { method: "PATCH", body: JSON.stringify(data) })

// Lessons
export const getTodayLesson   = ()                           => req("/api/lesson/today")
export const generateLesson   = ()                           => req("/api/lesson/generate", { method: "POST" })
export const completeLesson   = (id: number, score: number)  => req(`/api/lesson/complete?id=${id}&score=${score}`, { method: "POST" })
export const checkExercises   = (id: number, answers: any)   => req(`/api/lesson/check-exercises?id=${id}`, { method: "POST", body: JSON.stringify(answers) })
export const getLessonHistory = ()                           => req("/api/lesson/history")

// Flashcards
export const getFlashcards = (params?: { unit?: number; flagged?: boolean }) => {
  const qs = new URLSearchParams()
  if (params?.unit)    qs.set("unit", String(params.unit))
  if (params?.flagged) qs.set("flagged", "true")
  return req(`/api/flashcards?${qs}`)
}
export const addFlashcards    = (words: any[], lesson_id: number, unit: number) =>
  req("/api/flashcards/add", { method: "POST", body: JSON.stringify({ words, lesson_id, unit }) })
export const recordCardResult = (card_id: number, correct: boolean) =>
  req("/api/flashcards/result", { method: "POST", body: JSON.stringify({ card_id, correct }) })
export const getFlashcardStats = () => req("/api/flashcards/stats")

// Daily challenge
export const getTodayChallenge = () => req("/api/challenge/today")
export const checkChallenge    = (data: any) => req("/api/challenge/check", { method: "POST", body: JSON.stringify(data) })

// Assessment
export const generateAssessment = () => req("/api/assessment/generate", { method: "POST" })
export const gradeAssessment    = (data: any) => req("/api/assessment/grade", { method: "POST", body: JSON.stringify(data) })
