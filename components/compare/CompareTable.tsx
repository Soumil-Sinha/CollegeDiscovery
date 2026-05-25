import Link from "next/link"
import { formatFees, formatSalary } from "@/lib/insights"
import { InsightBadge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

interface PlacementStat {
  year: number
  avgSalary: number
  highestSalary: number
  placementRate: number
  medianSalary: number
}

interface CollegeCompare {
  id: string
  name: string
  slug: string
  location: string
  type: string
  established: number
  totalFees: number
  rating: number
  naacGrade: string | null
  courses: Array<{ name: string; fees: number }>
  placementStats: PlacementStat[]
  badges: string[]
}

interface CompareTableProps {
  colleges: CollegeCompare[]
}

function BestValue({ values, colleges, formatFn, higherIsBetter = true }: {
  values: number[]
  colleges: CollegeCompare[]
  formatFn: (v: number) => string
  higherIsBetter?: boolean
}) {
  const bestValue = higherIsBetter ? Math.max(...values) : Math.min(...values)

  return (
    <>
      {values.map((v, i) => (
        <td key={colleges[i].id} className={cn("px-5 py-3 text-sm text-center", v === bestValue && "bg-green-50 dark:bg-green-900/20 font-semibold text-green-700 dark:text-green-400")}>
          {formatFn(v)}
          {v === bestValue && <span className="ml-1 text-xs text-green-600">✓</span>}
        </td>
      ))}
    </>
  )
}

export function CompareTable({ colleges }: CompareTableProps) {
  const latestStats = colleges.map((c) => {
    const sorted = [...c.placementStats].sort((a, b) => b.year - a.year)
    return sorted[0]
  })

  const rows = [
    {
      label: "Location",
      render: (c: CollegeCompare) => <td key={c.id} className="px-5 py-3 text-sm text-center text-gray-700 dark:text-gray-200">{c.location}</td>,
    },
    {
      label: "Type",
      render: (c: CollegeCompare) => <td key={c.id} className="px-5 py-3 text-sm text-center"><span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-medium">{c.type}</span></td>,
    },
    {
      label: "Established",
      render: (c: CollegeCompare) => <td key={c.id} className="px-5 py-3 text-sm text-center text-gray-700 dark:text-gray-200">{c.established}</td>,
    },
    {
      label: "NAAC Grade",
      render: (c: CollegeCompare) => <td key={c.id} className="px-5 py-3 text-sm text-center font-medium text-gray-900 dark:text-gray-100">{c.naacGrade ?? "—"}</td>,
    },
    {
      label: "Rating",
      isMetric: true,
      values: colleges.map((c) => c.rating),
      formatFn: (v: number) => `${v.toFixed(1)} / 5`,
      higherIsBetter: true,
    },
    {
      label: "Total Fees",
      isMetric: true,
      values: colleges.map((c) => c.totalFees),
      formatFn: formatFees,
      higherIsBetter: false,
    },
    {
      label: "Avg Package (2024)",
      isMetric: true,
      values: latestStats.map((s) => s?.avgSalary ?? 0),
      formatFn: formatSalary,
      higherIsBetter: true,
    },
    {
      label: "Highest Package (2024)",
      isMetric: true,
      values: latestStats.map((s) => s?.highestSalary ?? 0),
      formatFn: formatSalary,
      higherIsBetter: true,
    },
    {
      label: "Median Package (2024)",
      isMetric: true,
      values: latestStats.map((s) => s?.medianSalary ?? 0),
      formatFn: formatSalary,
      higherIsBetter: true,
    },
    {
      label: "Placement Rate",
      isMetric: true,
      values: latestStats.map((s) => s?.placementRate ?? 0),
      formatFn: (v: number) => `${v}%`,
      higherIsBetter: true,
    },
    {
      label: "Insight Badges",
      render: (c: CollegeCompare) => (
        <td key={c.id} className="px-5 py-3 text-center">
          <div className="flex flex-wrap justify-center gap-1">
            {c.badges.length > 0 ? c.badges.map((b) => <InsightBadge key={b} label={b} />) : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}
          </div>
        </td>
      ),
    },
    {
      label: "Top Course",
      render: (c: CollegeCompare) => (
        <td key={c.id} className="px-5 py-3 text-sm text-center text-gray-700 dark:text-gray-200">
          {c.courses[0]?.name ?? "—"}
        </td>
      ),
    },
  ]

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36">
              Criteria
            </th>
            {colleges.map((c) => (
              <th key={c.id} className="px-5 py-4 text-center min-w-48">
                <Link href={`/colleges/${c.slug}`} className="hover:text-indigo-600 transition">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{c.name}</p>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-5 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">{row.label}</td>
              {"isMetric" in row && row.isMetric ? (
                <BestValue
                  values={row.values}
                  colleges={colleges}
                  formatFn={row.formatFn}
                  higherIsBetter={row.higherIsBetter}
                />
              ) : (
                colleges.map((c) => row.render!(c))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
