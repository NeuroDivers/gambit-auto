
import { BlockedDate } from "../hooks/useBlockedDates"

interface BlockedDatesListViewProps {
  blockedDates: BlockedDate[]
  children: React.ReactNode
}

export function BlockedDatesListView({ blockedDates, children }: BlockedDatesListViewProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Blocked Date Ranges</h4>
      {blockedDates && blockedDates.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {children}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground p-4 text-center border rounded-md">
          No dates are currently blocked
        </p>
      )}
    </div>
  )
}
