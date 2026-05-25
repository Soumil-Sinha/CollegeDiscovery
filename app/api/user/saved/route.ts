import { type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { savedCollegeSchema } from "@/lib/validations"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const saved = await prisma.savedCollege.findMany({
      where: { userId: session.user.id },
      select: {
        savedAt: true,
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            city: true,
            state: true,
            type: true,
            totalFees: true,
            rating: true,
            image: true,
            placementStats: {
              select: { year: true, avgSalary: true, placementRate: true },
              orderBy: { year: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    })

    return Response.json({ data: saved.map((s) => ({ ...s.college, savedAt: s.savedAt })) })
  } catch (error) {
    console.error("[GET /api/user/saved]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = savedCollegeSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: "Invalid college ID" }, { status: 400 })
    }

    const { collegeId } = parsed.data
    const userId = session.user.id

    const existing = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId, collegeId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.savedCollege.delete({ where: { userId_collegeId: { userId, collegeId } } })
      return Response.json({ data: { saved: false } })
    }

    await prisma.savedCollege.create({ data: { userId, collegeId } })
    return Response.json({ data: { saved: true } }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/user/saved]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
