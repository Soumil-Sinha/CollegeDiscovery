import { Suspense } from "react"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { CollegeFilters } from "@/components/college/CollegeFilters"
import { CollegeListClient } from "@/components/college/CollegeListClient"
import { CollegeGridSkeleton } from "@/components/ui/Skeleton"

export const metadata = {
  title: "Explore Colleges | CollegeDiscovery",
  description: "Search and filter from 30+ top colleges in India. Compare fees, placements, and more.",
}

export default async function CollegesPage() {
  const session = await auth()

  let savedCollegeIds: string[] = []
  if (session?.user?.id) {
    const saved = await prisma.savedCollege.findMany({
      where: { userId: session.user.id },
      select: { collegeId: true },
    })
    savedCollegeIds = saved.map((s) => s.collegeId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Discover</p>
          <h1 className="font-serif text-4xl text-gray-900">Explore colleges</h1>
          <p className="text-gray-500 text-sm mt-2">
            Discover and compare top engineering colleges across India.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
            <Suspense>
              <CollegeFilters />
            </Suspense>
          </aside>

          {/* College Grid */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<CollegeGridSkeleton />}>
              <CollegeListClient savedCollegeIds={savedCollegeIds} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
