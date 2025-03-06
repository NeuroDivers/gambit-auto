
import { format, parseISO } from "date-fns"
import { AlertCircle, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlockedDate } from "../hooks/useBlockedDates"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface BlockedDateItemProps {
  blockedDate: BlockedDate
  onDelete: (id: string) => void
}

export function BlockedDateItem({ blockedDate, onDelete }: BlockedDateItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const startDate = parseISO(blockedDate.start_date)
  const endDate = parseISO(blockedDate.end_date)
  
  const formattedStartDate = format(startDate, "MMM d, yyyy")
  const formattedEndDate = format(endDate, "MMM d, yyyy")
  
  const dateLabel = formattedStartDate === formattedEndDate
    ? formattedStartDate
    : `${formattedStartDate} to ${formattedEndDate}`
  
  const handleDelete = () => {
    onDelete(blockedDate.id)
    setShowDeleteConfirm(false)
  }
  
  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/10 transition-colors">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{dateLabel}</div>
          {blockedDate.reason && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {blockedDate.reason}
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unblock the date range {dateLabel}. Any previously blocked days will become available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
