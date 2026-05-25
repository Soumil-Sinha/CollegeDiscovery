import { type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { compareSchema } from "@/lib/validations"
import { computeInsightBadges, type CollegeWithStats } from "@/lib/insights"

export async function GET(request: NextRequest) {
  try {
    const rawIds = request.nextUrl.searchParams.get("ids") ?? ""
    const parsed = compareSchema.safeParse({ ids: rawIds })

    if (!parsed.success || parsed.data.ids.length < 2) {
      return Response.json({ error: "Provide 2–3 college IDs as ?ids=id1,id2,id3" }, { status: 400 })
    }

    const { ids } = parsed.data

    const colleges = await prisma.college.findMany({
      where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        city: true,
        state: true,
        type: true,
        established: true,
        totalFees: true,
        rating: true,
        naacGrade: true,
        image: true,
        courses: {
          select: { name: true, fees: true, duration: true, seats: true },
          orderBy: { fees: "desc" },
          take: 5,
        },
        placementStats: {
          select: { year: true, avgSalary: true, highestSalary: true, placementRate: true, medianSalary: true },
          orderBy: { year: "desc" },
        },
      },
    })

    if (colleges.length < 2) {
      return Response.json({ error: "Could not find enough colleges with provided IDs" }, { status: 404 })
    }

    const allStats: CollegeWithStats[] = colleges.map((c) => ({
      id: c.id,
      totalFees: c.totalFees,
      placementStats: c.placementStats,
    }))

    const result = colleges.map((college) => ({
      ...college,
      badges: computeInsightBadges(
        { id: college.id, totalFees: college.totalFees, placementStats: college.placementStats },
        allStats
      ),
    }))

    return Response.json({ data: result })
  } catch (error) {
    console.error("[GET /api/colleges/compare]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
