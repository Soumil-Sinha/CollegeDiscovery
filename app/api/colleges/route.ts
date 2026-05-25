import { type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { collegeFiltersSchema } from "@/lib/validations"
import { computeInsightBadges, type CollegeWithStats } from "@/lib/insights"

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = collegeFiltersSchema.safeParse(params)

    if (!parsed.success) {
      return Response.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 })
    }

    const { q, state, type, minFees, maxFees, minRating, course, page, limit, sort } = parsed.data
    const skip = (page - 1) * limit

    const where = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { city: { contains: q, mode: "insensitive" as const } },
          { state: { contains: q, mode: "insensitive" as const } },
        ],
      }),
      ...(state && { state: { contains: state, mode: "insensitive" as const } }),
      ...(type && { type }),
      ...((minFees !== undefined || maxFees !== undefined) && {
        totalFees: {
          ...(minFees !== undefined && { gte: minFees }),
          ...(maxFees !== undefined && { lte: maxFees }),
        },
      }),
      ...(minRating !== undefined && { rating: { gte: minRating } }),
      ...(course && {
        courses: { some: { name: { contains: course, mode: "insensitive" as const } } },
      }),
    }

    const orderBy = (() => {
      switch (sort) {
        case "rating": return { rating: "desc" as const }
        case "fees_asc": return { totalFees: "asc" as const }
        case "fees_desc": return { totalFees: "desc" as const }
        case "name": return { name: "asc" as const }
        default: return { rating: "desc" as const }
      }
    })()

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          description: true,
          placementStats: {
            select: { year: true, avgSalary: true, placementRate: true },
            orderBy: { year: "asc" },
          },
        },
      }),
      prisma.college.count({ where }),
    ])

    // Compute insight badges — needs all college stats for relative ranking
    const allCollegeStats = await prisma.college.findMany({
      select: {
        id: true,
        totalFees: true,
        placementStats: { select: { year: true, avgSalary: true, placementRate: true } },
      },
    })

    const collegesWithBadges = colleges.map((college) => {
      const statsForBadge: CollegeWithStats = {
        id: college.id,
        totalFees: college.totalFees,
        placementStats: college.placementStats,
      }
      const allStats: CollegeWithStats[] = allCollegeStats.map((c) => ({
        id: c.id,
        totalFees: c.totalFees,
        placementStats: c.placementStats,
      }))
      return { ...college, badges: computeInsightBadges(statsForBadge, allStats) }
    })

    return Response.json({
      data: collegesWithBadges,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("[GET /api/colleges]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
