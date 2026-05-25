import { type NextRequest } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { searchSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { COURSES, STATES } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "anonymous"
    const { allowed, remaining } = checkRateLimit(ip)

    if (!allowed) {
      return Response.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      )
    }

    const q = request.nextUrl.searchParams.get("q") ?? ""
    const parsed = searchSchema.safeParse({ q })

    if (!parsed.success) {
      return Response.json({ error: "Query must be 1–100 characters" }, { status: 400 })
    }

    const query = parsed.data.q.toLowerCase()

    const [colleges, locationResults] = await Promise.all([
      prisma.college.findMany({
        where: {
          OR: [
            { name: { contains: parsed.data.q, mode: "insensitive" } },
            { city: { contains: parsed.data.q, mode: "insensitive" } },
            { state: { contains: parsed.data.q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, slug: true, city: true, state: true, type: true, image: true, rating: true },
        take: 6,
        orderBy: { rating: "desc" },
      }),
      prisma.college.findMany({
        where: {
          OR: [
            { city: { contains: parsed.data.q, mode: "insensitive" } },
            { state: { contains: parsed.data.q, mode: "insensitive" } },
          ],
        },
        select: { city: true, state: true },
        distinct: ["state"],
        take: 3,
      }),
    ])

    // Deduplicate locations
    const seenLocations = new Set<string>()
    const locations = locationResults
      .flatMap((l) => [
        { label: l.city, type: "city" as const },
        { label: l.state, type: "state" as const },
      ])
      .filter((l) => {
        if (!l.label.toLowerCase().includes(query)) return false
        if (seenLocations.has(l.label)) return false
        seenLocations.add(l.label)
        return true
      })
      .slice(0, 4)

    // Match courses from static list
    const matchedCourses = COURSES.filter((c) =>
      c.toLowerCase().includes(query)
    ).slice(0, 3)

    // Also match state names from constants
    const matchedStates = STATES.filter((s) =>
      s.toLowerCase().includes(query)
    ).slice(0, 3).map((s) => ({ label: s, type: "state" as const }))

    const allLocations = [...locations, ...matchedStates]
      .filter((l, i, arr) => arr.findIndex((x) => x.label === l.label) === i)
      .slice(0, 4)

    return Response.json(
      {
        data: colleges,
        categories: {
          colleges,
          locations: allLocations,
          courses: matchedCourses,
        },
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    )
  } catch (error) {
    console.error("[GET /api/colleges/search]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
