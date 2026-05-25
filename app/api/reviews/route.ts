import { type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const { collegeId, rating, content } = parsed.data

    const college = await prisma.college.findUnique({ where: { id: collegeId }, select: { id: true } })
    if (!college) {
      return Response.json({ error: "College not found" }, { status: 404 })
    }

    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, collegeId },
      select: { id: true },
    })
    if (existing) {
      return Response.json({ error: "You have already reviewed this college" }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: { userId: session.user.id, collegeId, rating, content },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
      },
    })

    return Response.json({ data: review }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/reviews]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
