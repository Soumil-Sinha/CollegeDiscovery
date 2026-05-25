import { AVG_LIVING_COST_MONTHLY } from "./constants"

export type InsightBadge = "Top ROI" | "Best Value" | "Rising Placements" | "Highest Placed"

export interface CollegeWithStats {
  id: string
  totalFees: number
  placementStats: Array<{
    year: number
    avgSalary: number
    placementRate: number
  }>
}

export interface ROIResult {
  paybackMonths: number
  netGain5Years: number
  breakEvenYear: number
  monthlyDisposable: number
}

export function calculateROI(fees: number, expectedMonthlyPackage: number): ROIResult {
  const monthlyDisposable = expectedMonthlyPackage - AVG_LIVING_COST_MONTHLY
  const paybackMonths = monthlyDisposable > 0 ? Math.ceil(fees / monthlyDisposable) : Infinity
  const netGain5Years = expectedMonthlyPackage * 60 - fees
  const breakEvenYear = Math.ceil(paybackMonths / 12)

  return { paybackMonths, netGain5Years, breakEvenYear, monthlyDisposable }
}

export function computeInsightBadges(
  college: CollegeWithStats,
  allColleges: CollegeWithStats[]
): InsightBadge[] {
  const badges: InsightBadge[] = []
  const stats = college.placementStats.sort((a, b) => b.year - a.year)

  if (stats.length === 0) return badges

  const latestStat = stats[0]

  // "Best Value": placement rate > 80% AND fees < 150000
  if (latestStat.placementRate > 80 && college.totalFees < 150000) {
    badges.push("Best Value")
  }

  // "Rising Placements": avgSalary improved by 15%+ year over year
  if (stats.length >= 2) {
    const prev = stats[1].avgSalary
    const curr = stats[0].avgSalary
    if (prev > 0 && (curr - prev) / prev >= 0.15) {
      badges.push("Rising Placements")
    }
  }

  // "Highest Placed": avgSalary in top 5 overall
  const allAvgSalaries = allColleges
    .map((c) => {
      const s = c.placementStats.sort((a, b) => b.year - a.year)[0]
      return { id: c.id, avgSalary: s?.avgSalary ?? 0 }
    })
    .sort((a, b) => b.avgSalary - a.avgSalary)
    .slice(0, 5)
    .map((c) => c.id)

  if (allAvgSalaries.includes(college.id)) {
    badges.push("Highest Placed")
  }

  // "Top ROI": netGain5Years in top 10% of all colleges
  const allNetGains = allColleges
    .map((c) => {
      const s = c.placementStats.sort((a, b) => b.year - a.year)[0]
      const avgSalary = s?.avgSalary ?? 0
      return { id: c.id, netGain: avgSalary * 60 - c.totalFees }
    })
    .sort((a, b) => b.netGain - a.netGain)

  const top10pctIndex = Math.floor(allNetGains.length * 0.1)
  const top10pct = allNetGains.slice(0, Math.max(1, top10pctIndex)).map((c) => c.id)

  if (top10pct.includes(college.id)) {
    badges.push("Top ROI")
  }

  return badges
}

export function formatSalary(amount: number): string {
  if (amount >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(1)}L`
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`
  return `₹${amount}`
}

export function formatFees(amount: number): string {
  if (amount >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(1)}L`
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`
  return `₹${amount.toLocaleString("en-IN")}`
}
