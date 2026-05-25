"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { CompareTable } from "./CompareTable"
import { Skeleton } from "@/components/ui/Skeleton"
import Link from "next/link"

interface CollegeBasic {
  id: string
  name: string
  slug: string
  city: string
  state: string
  type: string
}

interface CollegeCompare extends CollegeBasic {
  location: string
  established: number
  totalFees: number
  rating: number
  naacGrade: string | null
  courses: Array<{ name: string; fees: number }>
  placementStats: Array<{ year: number; avgSalary: number; highestSalary: number; placementRate: number; medianSalary: number }>
  badges: string[]
}

export function ComparePageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [colleges, setColleges] = useState<CollegeCompare[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CollegeBasic[]>([])
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? []

  useEffect(() => {
    if (ids.length < 1) { setColleges([]); return }
    setIsLoading(true)
    fetch(`/api/colleges/compare?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setColleges(d.data ?? []))
      .finally(() => setIsLoading(false))
  }, [searchParams.toString()])

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/colleges/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.data ?? [])
    }, 300)
    setDebounceTimer(timer)
  }, [searchQuery])

  function addCollege(college: CollegeBasic) {
    if (ids.includes(college.id) || ids.length >= 3) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("ids", [...ids, college.id].join(","))
    router.push(`${pathname}?${params.toString()}`)
    setSearchQuery("")
    setSearchResults([])
  }

  function removeCollege(id: string) {
    const newIds = ids.filter((x) => x !== id)
    const params = new URLSearchParams(searchParams.toString())
    if (newIds.length > 0) {
      params.set("ids", newIds.join(","))
    } else {
      params.delete("ids")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/compare?ids=${ids.join(",")}`
    : ""

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="space-y-6">
      {/* Add colleges bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {colleges.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 max-w-40 truncate">{c.name}</span>
              <button
                onClick={() => removeCollege(c.id)}
                className="text-indigo-400 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
          {ids.length < 3 && (
            <div className="relative flex-1 min-w-48">
              <input
                type="text"
                placeholder="Search to add a college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-10 overflow-hidden">
                  {searchResults
                    .filter((r) => !ids.includes(r.id))
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => addCollege(r)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
                      >
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-medium">{r.type}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{r.city}, {r.state}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          {ids.length >= 2 && (
            <button
              onClick={copyShareLink}
              className="press ml-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              Copy link
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-xl" />
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
        </div>
      )}

      {!isLoading && colleges.length < 2 && (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center fade-in">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Search and add at least 2 colleges to compare them side-by-side.
          </p>
          <Link href="/colleges" className="link-underline inline-block mt-4 text-sm text-indigo-600">
            Browse all colleges
          </Link>
        </div>
      )}

      {!isLoading && colleges.length >= 2 && (
        <CompareTable colleges={colleges} />
      )}
    </div>
  )
}
