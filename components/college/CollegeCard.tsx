"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { InsightBadge } from "@/components/ui/Badge"
import { formatFees, formatSalary } from "@/lib/insights"
import { cn } from "@/lib/utils"

interface PlacementStat {
  year: number
  avgSalary: number
  placementRate: number
}

function PlacementSparkline({ stats }: { stats: PlacementStat[] }) {
  const sorted = [...stats].sort((a, b) => a.year - b.year)
  const values = sorted.map((s) => s.avgSalary)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 80
  const H = 24
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x},${y}`
  })
  const isUp = values[values.length - 1] > values[0]
  const color = isUp ? "#6366f1" : "#f87171"
  const pct = ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)

  return (
    <div className="flex items-center gap-2">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number)
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />
        })}
      </svg>
      <span className={`text-xs font-semibold inline-flex items-center gap-0.5 ${isUp ? "text-indigo-600" : "text-red-500"}`}>
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
          {isUp ? <path d="M5 1l4 5H1z" /> : <path d="M5 9L1 4h8z" />}
        </svg>
        {Math.abs(Number(pct))}%
      </span>
      <span className="text-[10px] text-gray-400 tracking-wider uppercase">3yr</span>
    </div>
  )
}

interface CollegeCardData {
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

interface CollegeCardProps {
  college: CollegeCardData
  savedIds?: Set<string>
  onToggleSave?: (id: string, saved: boolean) => void
  compareIds?: string[]
  onToggleCompare?: (id: string) => void
}

export function CollegeCard({ college, savedIds, onToggleSave, compareIds, onToggleCompare }: CollegeCardProps) {
  const { data: session } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  const isSaved = savedIds?.has(college.id) ?? false
  const isInCompare = compareIds?.includes(college.id) ?? false
  const latestStat = college.placementStats[college.placementStats.length - 1]

  async function handleSaveToggle(e: React.MouseEvent) {
    e.preventDefault()
    if (!session) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/user/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: college.id }),
      })
      const data = await res.json()
      onToggleSave?.(college.id, data.data.saved)
    } finally {
      setIsSaving(false)
    }
  }

  const typeBorderColors: Record<string, string> = {
    IIT: "text-red-700 border-red-200/60 bg-red-50/60",
    NIT: "text-blue-700 border-blue-200/60 bg-blue-50/60",
    IIIT: "text-violet-700 border-violet-200/60 bg-violet-50/60",
    DEEMED: "text-orange-700 border-orange-200/60 bg-orange-50/60",
    PRIVATE: "text-teal-700 border-teal-200/60 bg-teal-50/60",
    STATE: "text-emerald-700 border-emerald-200/60 bg-emerald-50/60",
    CENTRAL: "text-indigo-700 border-indigo-200/60 bg-indigo-50/60",
  }

  return (
    <Card hover className="flex flex-col h-full relative group">
      <Link href={`/colleges/${college.slug}`} className="flex flex-col h-full p-5 gap-4">
        {/* Header */}
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
            {college.image ? (
              <Image
                src={college.image}
                alt={college.name}
                width={56}
                height={56}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-gray-300">
                {college.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">{college.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {college.city}, {college.state}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={cn("text-[10px] tracking-wider uppercase font-medium px-1.5 py-0.5 rounded border", typeBorderColors[college.type] ?? "bg-gray-50 text-gray-600 border-gray-200")}>
                {college.type}
              </span>
              {college.naacGrade && (
                <span className="text-[10px] tracking-wider uppercase text-gray-500">NAAC {college.naacGrade}</span>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={cn("w-3.5 h-3.5", star <= Math.round(college.rating) ? "text-amber-400" : "text-gray-200")}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs font-medium text-gray-700 ml-0.5 numeric">{college.rating.toFixed(1)}</span>
        </div>

        {/* Insight Badges */}
        {college.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {college.badges.map((badge) => (
              <InsightBadge key={badge} label={badge} />
            ))}
          </div>
        )}

        {/* Placement Sparkline */}
        {college.placementStats.length >= 2 && (
          <PlacementSparkline stats={college.placementStats} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-auto pt-2 border-t border-gray-100">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 tracking-wider uppercase">Fees</p>
            <p className="numeric text-base text-gray-900 mt-0.5">{formatFees(college.totalFees)}</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-wider uppercase">Avg CTC</p>
            <p className="numeric text-base text-gray-900 mt-0.5">
              {latestStat ? formatSalary(latestStat.avgSalary) : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 tracking-wider uppercase">Placed</p>
            <p className="numeric text-base text-gray-900 mt-0.5">
              {latestStat ? `${latestStat.placementRate}%` : "N/A"}
            </p>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-stone-50/40 rounded-b-xl">
        {onToggleCompare && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleCompare(college.id) }}
            className={cn(
              "press text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-200 inline-flex items-center gap-1",
              isInCompare
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-200"
            )}
          >
            {isInCompare ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Comparing
              </>
            ) : "+ Compare"}
          </button>
        )}
        {session && onToggleSave && (
          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            className={cn(
              "press ml-auto text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-200 inline-flex items-center gap-1",
              isSaved ? "text-rose-600 hover:bg-rose-50" : "text-gray-500 hover:bg-gray-200"
            )}
          >
            <svg
              className={cn("w-3.5 h-3.5 transition-transform duration-300", isSaved && "scale-110")}
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {isSaved ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </Card>
  )
}
