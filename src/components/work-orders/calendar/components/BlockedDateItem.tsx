
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { BlockedDate } from "../hooks/useBlockedDates"

interface BlockedDateItemProps {
  blockedDate: BlockedDate
  onRemove: (id: string) => void
  isRemoving: boolean
}

export function BlockedDateItem({ blockedDate, onRemove, isRemoving }: BlockedDateItemProps) {
  const startDate = parseISO(blockedDate.start_date)
  const endDate = parseISO(blockedDate.end_date)
  const isRange = blockedDate.start_date !== blockedDate.end_date
  
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="space-y-1">
        <div className="font-medium">
          {format(startDate, "MMMM d, yyyy")}
          {isRange && ` - ${format(endDate, "MMMM d, yyyy")}`}
        </div>
        {blockedDate.reason && (
          <p className="text-sm text-muted-foreground">{blockedDate.reason}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(blockedDate.id)}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-destructive" />
        )}
      </Button>
    </div>
  )
}
