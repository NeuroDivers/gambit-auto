
import { Skeleton } from "@/components/ui/skeleton"

export function NavSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="px-3">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <Skeleton key={itemIndex} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
