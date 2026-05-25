"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"

interface PlacementStat {
  year: number
  avgSalary: number
  highestSalary: number
  medianSalary: number
  placementRate: number
}

interface PlacementChartProps {
  stats: PlacementStat[]
  showHighest?: boolean
  showMedian?: boolean
}

export function PlacementChart({ stats, showHighest = true, showMedian = true }: PlacementChartProps) {
  const data = stats.map((s) => ({
    year: String(s.year),
    "Avg Salary": Math.round(s.avgSalary / 100000 * 10) / 10,
    "Highest Salary": Math.round(s.highestSalary / 100000 * 10) / 10,
    "Median Salary": Math.round(s.medianSalary / 100000 * 10) / 10,
    "Placement %": s.placementRate,
  }))

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No placement data available</div>
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `₹${v}L`}
            tick={{ fontSize: 12 }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value) => [`₹${value}L`, ""]}
            contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="Avg Salary"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#6366f1" }}
            activeDot={{ r: 6 }}
          />
          {showHighest && (
            <Line
              type="monotone"
              dataKey="Highest Salary"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "#10b981" }}
            />
          )}
          {showMedian && (
            <Line
              type="monotone"
              dataKey="Median Salary"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "#f59e0b" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
