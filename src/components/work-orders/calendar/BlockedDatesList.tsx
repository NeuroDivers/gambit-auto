
import { BlockedDate } from "./hooks/useBlockedDates"
import { CalendarOff } from "lucide-react"

export function BlockedDatesList({ children }: { children: React.ReactNode }) {
  return (
    <BlockedDatesListView blockedDates={[]} children={children} />
  )
}

interface BlockedDatesListViewProps {
  blockedDates: BlockedDate[]
  children: React.ReactNode
}

export function BlockedDatesListView({ blockedDates, children }: BlockedDatesListViewProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-lg flex items-center gap-2">
        <CalendarOff className="h-4 w-4" />
        Blocked Date Ranges
      </h4>
      {blockedDates && blockedDates.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {children}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-8 text-center border rounded-md flex flex-col items-center gap-2 bg-muted/10">
          <CalendarOff className="h-8 w-8 text-muted-foreground opacity-50" />
          <p>No dates are currently blocked</p>
          <p className="text-xs max-w-[300px]">
            When you block dates, they will appear here and be unavailable for scheduling on the calendar.
          </p>
        </div>
      )}
    </div>
  )
}
