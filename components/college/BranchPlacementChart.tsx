"use client"

import { useState } from "react"
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

interface BranchStat {
  branch: string
  year: number
  avgSalary: number
  highestSalary: number
  placementRate: number
}

interface Props {
  stats: BranchStat[]
}

const BRANCH_COLORS: Record<string, string> = {
  CSE: "#6366f1",
  ECE: "#06b6d4",
  ME:  "#f59e0b",
  CE:  "#10b981",
  EE:  "#f43f5e",
}

const YEARS = [2022, 2023, 2024]

export function BranchPlacementChart({ stats }: Props) {
  const [metric, setMetric] = useState<"avgSalary" | "placementRate">("avgSalary")
  const [selectedYear, setSelectedYear] = useState(2024)

  const branches = [...new Set(stats.map((s) => s.branch))].sort()

  // Bar chart data: one bar per branch for selected year
  const barData = branches.map((branch) => {
    const stat = stats.find((s) => s.branch === branch && s.year === selectedYear)
    return {
      branch,
      avgSalary: stat ? Math.round(stat.avgSalary / 100000) : 0,
      placementRate: stat?.placementRate ?? 0,
    }
  })

  const label = metric === "avgSalary" ? "Avg Salary (LPA)" : "Placement Rate (%)"

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {(["avgSalary", "placementRate"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                metric === m ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {m === "avgSalary" ? "Avg Salary" : "Placement %"}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                selectedYear === y ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div>
        <p className="text-xs text-gray-500 mb-2">{label} by Branch — {selectedYear}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) =>
                metric === "avgSalary" ? [`${value} LPA`, "Avg Salary"] : [`${value}%`, "Placed"]
              }
            />
            <Bar
              dataKey={metric === "avgSalary" ? "avgSalary" : "placementRate"}
              radius={[4, 4, 0, 0]}
            >
              {barData.map((entry) => (
                <Cell key={entry.branch} fill={BRANCH_COLORS[entry.branch] ?? "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend lines */}
      <div>
        <p className="text-xs text-gray-500 mb-2">{label} trend (2022–2024)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Branch</th>
                {YEARS.map((y) => (
                  <th key={y} className="text-right py-2 text-gray-500 font-medium">{y}</th>
                ))}
                <th className="text-right py-2 text-gray-500 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => {
                const branchStats = YEARS.map((y) => stats.find((s) => s.branch === branch && s.year === y))
                const vals = branchStats.map((s) =>
                  s ? (metric === "avgSalary" ? Math.round(s.avgSalary / 100000) : s.placementRate) : 0
                )
                const isUp = vals[2] > vals[0]
                return (
                  <tr key={branch} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: BRANCH_COLORS[branch] ?? "#6366f1" }} />
                        <span className="font-medium text-gray-900">{branch}</span>
                      </span>
                    </td>
                    {vals.map((v, i) => (
                      <td key={i} className="text-right py-2 text-gray-700">
                        {metric === "avgSalary" ? `${v} LPA` : `${v}%`}
                      </td>
                    ))}
                    <td className="text-right py-2">
                      <span className={`inline-flex items-center justify-end font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                          {isUp ? <path d="M5 1l4 5H1z" /> : <path d="M5 9L1 4h8z" />}
                        </svg>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
