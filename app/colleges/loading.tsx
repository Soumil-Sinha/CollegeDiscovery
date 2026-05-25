import { CollegeGridSkeleton } from "@/components/ui/Skeleton"
import { Skeleton } from "@/components/ui/Skeleton"

export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-6">
          <div className="hidden lg:block w-64 space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="flex-1">
            <CollegeGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
