import { Suspense } from "react"
import Link from "next/link"
import { ComparePageClient } from "@/components/compare/ComparePageClient"
import { Skeleton } from "@/components/ui/Skeleton"

export const metadata = {
  title: "Compare Colleges | CollegeDiscovery",
  description: "Side-by-side comparison of up to 3 colleges. Compare fees, placements, ratings, and more.",
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Side-by-Side</p>
          <h1 className="font-serif text-4xl text-gray-900 dark:text-white">Compare colleges</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl">
            Compare up to 3 colleges side-by-side. Add colleges from the{" "}
            <Link href="/colleges" className="link-underline text-indigo-600">listing page</Link> or search below.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <ComparePageClient />
        </Suspense>
      </div>
    </div>
  )
}
