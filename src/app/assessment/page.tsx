"use client"
import { useState } from "react"
import { generateAssessment, gradeAssessment } from "@/lib/api"

export default function AssessmentPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [results, setResults]       = useState<Record<number, any>>({})
  const [generating, setGenerating] = useState(false)
  const [grading, setGrading]       = useState(false)
  const [score, setScore]           = useState<number | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const a = await generateAssessment()
      setAssessment(a)
      setAnswers({})
      setResults({})
      setScore(null)
    } catch (e: any) { alert(e.message) }
    finally { setGenerating(false) }
  }

  async function handleGrade() {
    setGrading(true)
    try {
      const res = await gradeAssessment({ questions: assessment.questions, answers })
      setResults(res)
      const correct = Object.values(res).filter((r: any) => r.correct).length
      setScore(Math.round(correct / assessment.questions.length * 100))
    } finally { setGrading(false) }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">평가 · Assessment</h1>
      <p className="text-gray-500 text-sm">Tests the last 5 grammar topics you've completed.</p>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-[#e94560] text-white py-3 rounded-xl font-medium disabled:opacity-50"
      >
        {generating ? "Generating..." : "🚀 Generate Assessment"}
      </button>

      {score !== null && (
        <div className={`rounded-xl p-4 text-center ${score >= 80 ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
          <div className="text-3xl font-bold">{score}%</div>
          <p className="text-sm text-gray-600 mt-1">{Object.values(results).filter((r: any) => r.correct).length}/{assessment?.questions?.length} correct</p>
        </div>
      )}

      {assessment && (
        <div className="space-y-4">
          <h2 className="font-bold">{assessment.title}</h2>
          {assessment.questions.map((q: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{q.type}</p>
              <p className="text-sm mb-2">{q.prompt}</p>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e94560]"
                placeholder="Answer..."
                value={answers[i] ?? ""}
                onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
              />
              {results[i] && (
                <p className={`text-xs mt-2 ${results[i].correct ? "text-green-600" : "text-red-500"}`}>
                  {results[i].correct ? "✅" : "❌"} {results[i].feedback}
                </p>
              )}
            </div>
          ))}
          <button
            onClick={handleGrade}
            disabled={grading}
            className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {grading ? "Grading..." : "Submit Assessment"}
          </button>
        </div>
      )}
    </div>
  )
}
