"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { CollegeCard } from "./CollegeCard"
import { CollegeGridSkeleton } from "@/components/ui/Skeleton"
import { Button } from "@/components/ui/Button"

interface PlacementStat {
  year: number
  avgSalary: number
  placementRate: number
}

interface CollegeData {
  id: string
  name: string
  slug: string
  location: string
  city: string
  state: string
  type: string
  totalFees: number
  rating: number
  naacGrade: string | null
  image: string | null
  description: string
  placementStats: PlacementStat[]
  badges: string[]
}

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

interface CollegeListClientProps {
  savedCollegeIds?: string[]
}

export function CollegeListClient({ savedCollegeIds = [] }: CollegeListClientProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [colleges, setColleges] = useState<CollegeData[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set(savedCollegeIds))
  const [compareIds, setCompareIds] = useState<string[]>([])

  const fetchColleges = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/colleges?${searchParams.toString()}`)
      const data = await res.json()
      setColleges(data.data ?? [])
      setMeta(data.meta ?? null)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchColleges()
  }, [fetchColleges])

  // Sync saved IDs from session changes
  useEffect(() => {
    setSavedIds(new Set(savedCollegeIds))
  }, [savedCollegeIds])

  function handleToggleSave(id: string, saved: boolean) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (saved) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleToggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  if (isLoading) return <CollegeGridSkeleton />

  if (colleges.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium mb-1">No colleges found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{meta?.total ?? 0}</span> colleges found
        </p>
        {compareIds.length >= 2 && (
          <a
            href={`/compare?ids=${compareIds.join(",")}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            Compare {compareIds.length} colleges →
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <CollegeCard
            key={college.id}
            college={college}
            savedIds={session ? savedIds : undefined}
            onToggleSave={session ? handleToggleSave : undefined}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} />
        </div>
      )}
    </div>
  )
}

function PaginationControls({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const searchParams = useSearchParams()

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `/colleges?${params.toString()}`
  }

  const pages: (number | "...")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("...")
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <>
      <a
        href={pageHref(Math.max(1, currentPage - 1))}
        className={`px-3 py-1.5 rounded-lg text-sm border transition ${currentPage === 1 ? "opacity-50 pointer-events-none border-gray-200 text-gray-400" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
      >
        ← Prev
      </a>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <a
            key={p}
            href={pageHref(p)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${p === currentPage ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            {p}
          </a>
        )
      )}
      <a
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        className={`px-3 py-1.5 rounded-lg text-sm border transition ${currentPage === totalPages ? "opacity-50 pointer-events-none border-gray-200 text-gray-400" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
      >
        Next →
      </a>
    </>
  )
}
