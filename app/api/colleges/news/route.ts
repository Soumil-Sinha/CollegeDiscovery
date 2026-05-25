import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""
  if (!q) return Response.json({ error: "Query required" }, { status: 400 })

  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    return Response.json({ error: "NEWS_API_KEY not configured" }, { status: 200 })
  }

  try {
    const url = new URL("https://newsapi.org/v2/everything")
    url.searchParams.set("q", `"${q}" college`)
    url.searchParams.set("language", "en")
    url.searchParams.set("sortBy", "publishedAt")
    url.searchParams.set("pageSize", "5")
    url.searchParams.set("apiKey", apiKey)

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    const json = await res.json()

    if (json.status !== "ok") {
      return Response.json({ data: [] })
    }

    const articles = (json.articles ?? []).map((a: {
      title: string
      url: string
      source: { name: string }
      publishedAt: string
      description: string | null
    }) => ({
      title: a.title,
      url: a.url,
      source: a.source?.name ?? "Unknown",
      publishedAt: a.publishedAt,
      description: a.description,
    }))

    return Response.json({ data: articles })
  } catch (error) {
    console.error("[GET /api/colleges/news]", error)
    return Response.json({ data: [] })
  }
}
