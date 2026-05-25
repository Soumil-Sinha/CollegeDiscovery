import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { computeInsightBadges } from "@/lib/insights"
import { formatFees, formatSalary } from "@/lib/insights"
import { InsightBadge } from "@/components/ui/Badge"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { PlacementChart } from "@/components/college/PlacementChart"
import { BranchPlacementChart } from "@/components/college/BranchPlacementChart"
import { ReviewSection } from "@/components/college/ReviewSection"
import { NewsFeed } from "@/components/college/NewsFeed"
import { SaveCollegeButton } from "@/components/college/SaveCollegeButton"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const college = await prisma.college.findUnique({ where: { slug }, select: { name: true, description: true } })
  if (!college) return {}
  return {
    title: `${college.name} | CollegeDiscovery`,
    description: college.description.slice(0, 160),
  }
}

export default async function CollegeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const college = await prisma.college.findUnique({
    where: { slug },
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
      branchPlacementStats: {
        select: { branch: true, year: true, avgSalary: true, highestSalary: true, placementRate: true },
        orderBy: [{ branch: "asc" }, { year: "asc" }],
      },
      placementStats: {
        select: {
          id: true, year: true, avgSalary: true, highestSalary: true,
          placementRate: true, medianSalary: true, topRecruiters: true,
        },
        orderBy: { year: "asc" },
      },
      reviews: {
        select: {
          id: true, rating: true, content: true, createdAt: true,
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { reviews: true, savedBy: true } },
    },
  })

  if (!college) notFound()

  let isSaved = false
  if (session?.user?.id) {
    const saved = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId: session.user.id, collegeId: college.id } },
      select: { id: true },
    })
    isSaved = !!saved
  }

  const allColleges = await prisma.college.findMany({
    select: {
      id: true,
      totalFees: true,
      placementStats: { select: { year: true, avgSalary: true, placementRate: true } },
    },
  })

  const badges = computeInsightBadges(
    { id: college.id, totalFees: college.totalFees, placementStats: college.placementStats },
    allColleges.map((c) => ({ id: c.id, totalFees: c.totalFees, placementStats: c.placementStats }))
  )

  const latestStat = college.placementStats[college.placementStats.length - 1]
  const avgRating = college.reviews.length > 0
    ? college.reviews.reduce((sum, r) => sum + r.rating, 0) / college.reviews.length
    : college.rating

  const allTopRecruiters = [...new Set(college.placementStats.flatMap((s) => s.topRecruiters))].slice(0, 15)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              {college.image ? (
                <Image src={college.image} alt={college.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300 dark:text-gray-600">
                  {college.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">
                  {college.type}
                </span>
                {college.naacGrade && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded font-medium">
                    NAAC {college.naacGrade}
                  </span>
                )}
                {badges.map((b) => <InsightBadge key={b} label={b} />)}
              </div>
              <h1 className="font-serif text-4xl text-gray-900 dark:text-gray-50 mb-2 leading-tight">{college.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {college.city}, {college.state} · Est. <span className="numeric">{college.established}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-2xl">{college.description}</p>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {session && (
                <SaveCollegeButton collegeId={college.id} initialSaved={isSaved} />
              )}
              <Link
                href={`/compare?ids=${college.id}`}
                className="text-sm text-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-lg transition"
              >
                + Add to Compare
              </Link>
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition"
                >
                  Visit Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Fees", value: formatFees(college.totalFees) },
                { label: "Rating", value: `${avgRating.toFixed(1)} / 5` },
                { label: "Avg CTC (2024)", value: latestStat ? formatSalary(latestStat.avgSalary) : "N/A" },
                { label: "Placement Rate", value: latestStat ? `${latestStat.placementRate}%` : "N/A" },
              ].map(({ label, value }) => (
                <Card key={label} className="transition-all duration-300 hover:border-gray-300">
                  <CardBody className="text-center py-4">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-1">{label}</p>
                    <p className="numeric text-2xl text-gray-900 dark:text-gray-100">{value}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Placement Trend */}
            <Card>
              <CardHeader>
                <h2 className="font-serif text-xl text-gray-900 dark:text-gray-100">Placement Trends</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Salary trends over 3 years (in Lakhs per annum)</p>
              </CardHeader>
              <CardBody>
                <PlacementChart stats={college.placementStats} />
              </CardBody>
            </Card>

            {/* Branch-wise Breakdown */}
            {college.branchPlacementStats.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="font-serif text-xl text-gray-900 dark:text-gray-100">Branch-wise Placement Breakdown</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Compare placement stats across CSE, ECE, ME, CE & EE</p>
                </CardHeader>
                <CardBody>
                  <BranchPlacementChart stats={college.branchPlacementStats} />
                </CardBody>
              </Card>
            )}

            {/* Courses */}
            <Card>
              <CardHeader>
                <h2 className="font-serif text-xl text-gray-900 dark:text-gray-100">Courses Offered</h2>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {college.courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{course.duration} years · {course.seats} seats</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatFees(course.fees)}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* News Feed */}
            <Card>
              <CardHeader>
                <h2 className="font-serif text-xl text-gray-900 dark:text-gray-100">Latest News</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Recent coverage about {college.name}</p>
              </CardHeader>
              <CardBody>
                <NewsFeed collegeName={college.name} />
              </CardBody>
            </Card>

            {/* Reviews */}
            <ReviewSection
              collegeId={college.id}
              reviews={college.reviews}
              reviewCount={college._count.reviews}
              session={session}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Placement Details */}
            {latestStat && (
              <Card>
                <CardHeader>
                  <h3 className="font-serif text-lg text-gray-900 dark:text-gray-100">Placements 2024</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  {[
                    { label: "Average Package", value: formatSalary(latestStat.avgSalary) },
                    { label: "Highest Package", value: formatSalary(latestStat.highestSalary) },
                    { label: "Median Package", value: formatSalary(latestStat.medianSalary) },
                    { label: "Students Placed", value: `${latestStat.placementRate}%` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}

            {/* Top Recruiters */}
            <Card>
              <CardHeader>
                <h3 className="font-serif text-lg text-gray-900 dark:text-gray-100">Top Recruiters</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {allTopRecruiters.map((company) => (
                    <span key={company} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                      {company}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Year-wise Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-serif text-lg text-gray-900 dark:text-gray-100">Year-wise Placements</h3>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[...college.placementStats].reverse().map((stat) => (
                    <div key={stat.id} className="px-5 py-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stat.year}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{stat.placementRate}% placed</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${stat.placementRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg: {formatSalary(stat.avgSalary)}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
