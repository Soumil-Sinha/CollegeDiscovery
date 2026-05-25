import { type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { isCompleted } = await req.json()

  const existing = await prisma.admissionDeadline.findUnique({ where: { id }, select: { userId: true } })
  if (!existing || existing.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.admissionDeadline.update({
    where: { id },
    data: { isCompleted: Boolean(isCompleted) },
    select: { id: true, isCompleted: true },
  })

  return Response.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.admissionDeadline.findUnique({ where: { id }, select: { userId: true } })
  if (!existing || existing.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.admissionDeadline.delete({ where: { id } })
  return Response.json({ data: { deleted: true } })
}
