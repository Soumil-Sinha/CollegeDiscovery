import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatFees, formatSalary } from "@/lib/insights"
import { Card, CardBody } from "@/components/ui/Card"
import { ROICalculator } from "@/components/dashboard/ROICalculator"
import { DeadlineTracker } from "@/components/dashboard/DeadlineTracker"

export const metadata = { title: "Dashboard | CollegeDiscovery" }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const saved = await prisma.savedCollege.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
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
          naacGrade: true,
          placementStats: {
            select: { year: true, avgSalary: true, placementRate: true },
            orderBy: { year: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  const savedColleges = saved.map((s) => ({ ...s.college, savedAt: s.savedAt }))

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {session.user.image ? (
            <Image src={session.user.image} alt="Avatar" width={48} height={48} className="rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
              {session.user.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Dashboard</p>
            <h1 className="font-serif text-4xl text-gray-900 dark:text-white leading-tight">
              Welcome, <span className="italic">{session.user.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><span className="numeric">{savedColleges.length}</span> saved colleges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved colleges */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-serif text-2xl text-gray-900 dark:text-white">Saved Colleges</h2>

            {savedColleges.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center fade-in">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">You haven&apos;t saved any colleges yet.</p>
                <Link href="/colleges" className="link-underline inline-block mt-4 text-sm text-indigo-600">
                  Browse colleges
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedColleges.map((college) => {
                  const latestStat = college.placementStats[0]
                  return (
                    <Card key={college.id} hover>
                      <CardBody>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                            {college.image ? (
                              <Image src={college.image} alt={college.name} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 dark:text-gray-500">
                                {college.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/colleges/${college.slug}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-1">
                              {college.name}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{college.city}, {college.state}</p>
                          </div>
                          <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Fees</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatFees(college.totalFees)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Avg CTC</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {latestStat ? formatSalary(latestStat.avgSalary) : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{college.rating.toFixed(1)}</p>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}

                {savedColleges.length >= 2 && (
                  <Link
                    href={`/compare?ids=${savedColleges.slice(0, 3).map((c) => c.id).join(",")}`}
                    className="block w-full text-center text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-4 py-3 rounded-xl transition font-medium"
                  >
                    Compare your saved colleges →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {savedColleges.length > 0 ? (
              <ROICalculator
                colleges={savedColleges.map((c) => ({
                  id: c.id,
                  name: c.name,
                  totalFees: c.totalFees,
                  placementStats: c.placementStats,
                }))}
              />
            ) : (
              <Card>
                <CardBody className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  Save colleges to use the ROI Calculator
                </CardBody>
              </Card>
            )}

            <DeadlineTracker
              initialDeadlines={deadlines.map((d) => ({
                ...d,
                deadlineDate: d.deadlineDate.toISOString(),
                createdAt: d.createdAt.toISOString(),
              }))}
              savedColleges={savedColleges.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                type: c.type,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
