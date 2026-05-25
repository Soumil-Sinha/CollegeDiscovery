import { SEARCH_RATE_LIMIT } from "./constants"

const requests = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = requests.get(ip)

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + SEARCH_RATE_LIMIT.windowMs })
    return { allowed: true, remaining: SEARCH_RATE_LIMIT.max - 1 }
  }

  if (entry.count >= SEARCH_RATE_LIMIT.max) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: SEARCH_RATE_LIMIT.max - entry.count }
}
