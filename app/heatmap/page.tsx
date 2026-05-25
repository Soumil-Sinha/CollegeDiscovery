import { prisma } from "@/lib/prisma"
import { SalaryHeatmap } from "@/components/insights/SalaryHeatmap"

export const dynamic = "force-dynamic"
export const metadata = { title: "National Salary Heatmap | CollegeDiscovery" }

export default async function HeatmapPage() {
  const colleges = await prisma.college.findMany({
    select: {
      state: true,
      city: true,
      name: true,
      type: true,
      placementStats: {
        select: { year: true, avgSalary: true, placementRate: true },
        orderBy: { year: "desc" },
        take: 1,
      },
    },
  })

  const stateMap = new Map<string, { totalSalary: number; count: number; colleges: string[]; types: string[] }>()

  for (const college of colleges) {
    const stat = college.placementStats[0]
    if (!stat) continue
    const entry = stateMap.get(college.state) ?? { totalSalary: 0, count: 0, colleges: [], types: [] }
    entry.totalSalary += stat.avgSalary
    entry.count += 1
    entry.colleges.push(college.name)
    if (!entry.types.includes(college.type)) entry.types.push(college.type)
    stateMap.set(college.state, entry)
  }

  const stateData = Array.from(stateMap.entries()).map(([state, v]) => ({
    state,
    avgSalary: Math.round(v.totalSalary / v.count),
    collegeCount: v.count,
    topColleges: v.colleges.slice(0, 3),
    types: v.types,
  })).sort((a, b) => b.avgSalary - a.avgSalary)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">National Insights</p>
          <h1 className="font-serif text-4xl text-gray-900 dark:text-white">Salary heatmap</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl">
            Average graduate salary by state — based on latest placement data from <span className="numeric text-gray-700 dark:text-gray-300">{colleges.length}</span> colleges.
          </p>
        </div>
        <SalaryHeatmap data={stateData} />
      </div>
    </div>
  )
}
