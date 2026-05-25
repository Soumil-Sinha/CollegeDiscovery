"use client"

import { useState, useEffect } from "react"

interface Article {
  title: string
  url: string
  source: string
  publishedAt: string
  description: string | null
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

interface Props {
  collegeName: string
}

export function NewsFeed({ collegeName }: Props) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/colleges/news?q=${encodeURIComponent(collegeName)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setArticles(d.data ?? [])
      })
      .catch(() => setError("Failed to load news"))
      .finally(() => setLoading(false))
  }, [collegeName])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-4/5" />
              <div className="h-2.5 bg-gray-100 rounded w-3/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error === "NEWS_API_KEY not configured") {
    return (
      <div className="text-center py-6 text-gray-400 text-sm space-y-2 fade-in">
        <div className="w-10 h-10 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
        </div>
        <p>Add <code className="bg-gray-100 px-1 rounded text-xs">NEWS_API_KEY</code> to <code className="bg-gray-100 px-1 rounded text-xs">.env.local</code> to enable live news.</p>
        <p className="text-xs">Get a free key at <span className="text-indigo-600">newsapi.org</span></p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        No recent news found for this college.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="flex gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition">
                {article.title}
              </p>
              {article.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{article.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                  {article.source}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(article.publishedAt)}</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      ))}
    </div>
  )
}
