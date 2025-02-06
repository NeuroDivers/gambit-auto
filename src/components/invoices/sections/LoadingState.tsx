
export function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-32 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
