import { type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { roiSchema } from "@/lib/validations"
import { calculateROI } from "@/lib/insights"

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = roiSchema.safeParse(params)

    if (!parsed.success) {
      return Response.json({ error: "Invalid parameters", details: parsed.error.flatten() }, { status: 400 })
    }

    const { collegeId, expectedMonthlyPackage } = parsed.data

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: {
        id: true,
        name: true,
        totalFees: true,
        placementStats: {
          select: { year: true, avgSalary: true },
          orderBy: { year: "desc" },
          take: 1,
        },
      },
    })

    if (!college) {
      return Response.json({ error: "College not found" }, { status: 404 })
    }

    const roi = calculateROI(college.totalFees, expectedMonthlyPackage)
    const avgPlacementSalary = college.placementStats[0]?.avgSalary ?? 0
    const avgROI = calculateROI(college.totalFees, Math.round(avgPlacementSalary / 12))

    return Response.json({
      data: {
        college: { id: college.id, name: college.name, totalFees: college.totalFees },
        userROI: roi,
        avgPlacementROI: avgROI,
        avgPlacementSalary,
      },
    })
  } catch (error) {
    console.error("[GET /api/insights/roi]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
