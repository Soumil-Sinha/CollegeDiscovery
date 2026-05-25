import { type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const college = await prisma.college.findFirst({
      where: { OR: [{ id }, { slug: id }] },
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
        description: true,
        website: true,
        image: true,
        courses: {
          select: { id: true, name: true, duration: true, fees: true, seats: true },
          orderBy: { name: "asc" },
        },
        placementStats: {
          select: {
            id: true,
            year: true,
            avgSalary: true,
            highestSalary: true,
            placementRate: true,
            medianSalary: true,
            topRecruiters: true,
          },
          orderBy: { year: "asc" },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { reviews: true, savedBy: true } },
      },
    })

    if (!college) {
      return Response.json({ error: "College not found" }, { status: 404 })
    }

    return Response.json({ data: college })
  } catch (error) {
    console.error("[GET /api/colleges/[id]]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
