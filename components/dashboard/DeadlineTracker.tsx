"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"

interface College {
  id: string
  name: string
  slug: string
  type: string
}

interface Deadline {
  id: string
  deadlineType: string
  deadlineDate: string
  note: string | null
  isCompleted: boolean
  college: College
}

const DEADLINE_TYPES = ["Application", "Entrance Exam", "Counseling", "Fee Payment", "Document Submission"] as const
type DeadlineType = typeof DEADLINE_TYPES[number]

const TYPE_COLORS: Record<string, string> = {
  "Application": "bg-blue-100 text-blue-700",
  "Entrance Exam": "bg-purple-100 text-purple-700",
  "Counseling": "bg-amber-100 text-amber-700",
  "Fee Payment": "bg-red-100 text-red-700",
  "Document Submission": "bg-green-100 text-green-700",
}

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

interface Props {
  initialDeadlines: Deadline[]
  savedColleges: College[]
}

export function DeadlineTracker({ initialDeadlines, savedColleges }: Props) {
  const [deadlines, setDeadlines] = useState(initialDeadlines)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    collegeId: savedColleges[0]?.id ?? "",
    deadlineType: "Application" as DeadlineType,
    deadlineDate: "",
    note: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const upcoming = deadlines.filter((d) => !d.isCompleted).sort(
    (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
  )
  const completed = deadlines.filter((d) => d.isCompleted)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.collegeId || !form.deadlineDate) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/user/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadlineDate: new Date(form.deadlineDate).toISOString(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setDeadlines((prev) => [...prev, data.data])
        setShowForm(false)
        setForm({ collegeId: savedColleges[0]?.id ?? "", deadlineType: "Application", deadlineDate: "", note: "" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleComplete(id: string, current: boolean) {
    const res = await fetch(`/api/user/deadlines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !current }),
    })
    if (res.ok) {
      setDeadlines((prev) => prev.map((d) => d.id === id ? { ...d, isCompleted: !current } : d))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/user/deadlines/${id}`, { method: "DELETE" })
    if (res.ok) setDeadlines((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-gray-900">Admission Deadlines</h3>
            <p className="text-xs text-gray-500 mt-0.5"><span className="numeric">{upcoming.length}</span> upcoming</p>
          </div>
          {savedColleges.length > 0 && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              + Add
            </button>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">College</label>
                <select
                  value={form.collegeId}
                  onChange={(e) => setForm((f) => ({ ...f, collegeId: e.target.value }))}
                  className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {savedColleges.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Type</label>
                <select
                  value={form.deadlineType}
                  onChange={(e) => setForm((f) => ({ ...f, deadlineType: e.target.value as DeadlineType }))}
                  className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEADLINE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Deadline Date</label>
              <input
                type="datetime-local"
                required
                value={form.deadlineDate}
                onChange={(e) => setForm((f) => ({ ...f, deadlineDate: e.target.value }))}
                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Note (optional)</label>
              <input
                type="text"
                maxLength={500}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Submit online at admission portal"
                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save Deadline"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Upcoming Deadlines */}
        {upcoming.length === 0 && !showForm ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            {savedColleges.length === 0
              ? "Save colleges first to track deadlines"
              : "No upcoming deadlines. Click + Add to set one."}
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((d) => {
              const days = daysUntil(d.deadlineDate)
              const isUrgent = days <= 7 && days >= 0
              const isOverdue = days < 0
              return (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition group">
                  <button
                    onClick={() => toggleComplete(d.id, d.isCompleted)}
                    className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 hover:border-indigo-500 flex-shrink-0 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/colleges/${d.college.slug}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition line-clamp-1">
                        {d.college.name}
                      </Link>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[d.deadlineType] ?? "bg-gray-100 text-gray-600"}`}>
                        {d.deadlineType}
                      </span>
                    </div>
                    {d.note && <p className="text-xs text-gray-500 mt-0.5">{d.note}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{formatDate(d.deadlineDate)}</span>
                      <span className={`text-xs font-semibold ${isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-500"}`}>
                        {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <details className="group">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
              {completed.length} completed deadline{completed.length > 1 ? "s" : ""}
            </summary>
            <div className="mt-2 space-y-1.5">
              {completed.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 opacity-60 transition-opacity hover:opacity-80">
                  <button
                    onClick={() => toggleComplete(d.id, d.isCompleted)}
                    className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center flex-shrink-0"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 line-through line-clamp-1">{d.college.name} · {d.deadlineType}</p>
                    <p className="text-xs text-gray-400">{formatDate(d.deadlineDate)}</p>
                  </div>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500 transition press" aria-label="Delete">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardBody>
    </Card>
  )
}
