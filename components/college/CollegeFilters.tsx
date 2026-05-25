"use client"

import { useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { COLLEGE_TYPES, STATES, FEES_RANGES, RATING_OPTIONS, COURSES } from "@/lib/constants"

export function CollegeFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function clearFilters() {
    router.push(pathname)
  }

  const hasFilters = ["state", "type", "minFees", "maxFees", "minRating", "course", "sort"].some((k) =>
    searchParams.has(k)
  )

  const selectedFeeRange = (() => {
    const min = searchParams.get("minFees")
    const max = searchParams.get("maxFees")
    if (!min && !max) return ""
    return `${min ?? ""}:${max ?? ""}`
  })()

  function handleFeeRange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("minFees")
    params.delete("maxFees")
    params.delete("page")
    if (value) {
      const [min, max] = value.split(":")
      if (min) params.set("minFees", min)
      if (max) params.set("maxFees", max)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const feeOptions = FEES_RANGES.map((r) => ({
    label: r.label,
    value: `${r.min}:${r.max === Infinity ? "" : r.max}`,
  }))

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-indigo-600">
            Clear all
          </Button>
        )}
      </div>

      <Select
        label="State"
        options={STATES.map((s) => ({ label: s, value: s }))}
        placeholder="All states"
        value={searchParams.get("state") ?? ""}
        onChange={(e) => updateFilter("state", e.target.value)}
      />

      <Select
        label="College Type"
        options={COLLEGE_TYPES.map((t) => ({ label: t, value: t }))}
        placeholder="All types"
        value={searchParams.get("type") ?? ""}
        onChange={(e) => updateFilter("type", e.target.value)}
      />

      <Select
        label="Fee Range"
        options={feeOptions}
        placeholder="Any fees"
        value={selectedFeeRange}
        onChange={(e) => handleFeeRange(e.target.value)}
      />

      <Select
        label="Min Rating"
        options={RATING_OPTIONS.map((r) => ({ label: r.label, value: String(r.value) }))}
        placeholder="Any rating"
        value={searchParams.get("minRating") ?? ""}
        onChange={(e) => updateFilter("minRating", e.target.value)}
      />

      <Select
        label="Course / Branch"
        options={COURSES.map((c) => ({ label: c, value: c }))}
        placeholder="Any course"
        value={searchParams.get("course") ?? ""}
        onChange={(e) => updateFilter("course", e.target.value)}
      />

      <Select
        label="Sort by"
        options={[
          { label: "Top Rated", value: "rating" },
          { label: "Fees: Low to High", value: "fees_asc" },
          { label: "Fees: High to Low", value: "fees_desc" },
          { label: "Best Placements", value: "placement" },
          { label: "Name A–Z", value: "name" },
        ]}
        placeholder="Relevance"
        value={searchParams.get("sort") ?? ""}
        onChange={(e) => updateFilter("sort", e.target.value)}
      />
    </div>
  )
}
