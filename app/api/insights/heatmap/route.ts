import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
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

    // Aggregate by state
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

    const data = Array.from(stateMap.entries()).map(([state, v]) => ({
      state,
      avgSalary: Math.round(v.totalSalary / v.count),
      collegeCount: v.count,
      topColleges: v.colleges.slice(0, 3),
      types: v.types,
    })).sort((a, b) => b.avgSalary - a.avgSalary)

    return Response.json({ data })
  } catch (error) {
    console.error("[GET /api/insights/heatmap]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
