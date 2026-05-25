import { type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  collegeId: z.string().cuid(),
  deadlineType: z.enum(["Application", "Entrance Exam", "Counseling", "Fee Payment", "Document Submission"]),
  deadlineDate: z.string().datetime(),
  note: z.string().max(500).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const deadlines = await prisma.admissionDeadline.findMany({
    where: { userId: session.user.id },
    orderBy: { deadlineDate: "asc" },
    select: {
      id: true,
      deadlineType: true,
      deadlineDate: true,
      note: true,
      isCompleted: true,
      createdAt: true,
      college: { select: { id: true, name: true, slug: true, type: true } },
    },
  })

  return Response.json({ data: deadlines })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

  const deadline = await prisma.admissionDeadline.create({
    data: {
      userId: session.user.id,
      collegeId: parsed.data.collegeId,
      deadlineType: parsed.data.deadlineType,
      deadlineDate: new Date(parsed.data.deadlineDate),
      note: parsed.data.note,
    },
    select: {
      id: true,
      deadlineType: true,
      deadlineDate: true,
      note: true,
      isCompleted: true,
      college: { select: { id: true, name: true, slug: true, type: true } },
    },
  })

  return Response.json({ data: deadline }, { status: 201 })
}
