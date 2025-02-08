
import { Button } from "@/components/ui/button"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { format } from "date-fns"
import { Trash2, CalendarX } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export function BlockedDatesList() {
  const { blockedDates } = useBlockedDates()
  const { isAdmin } = useAdminStatus()

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success("Blocked date removed")
    } catch (error) {
      console.error('Error removing blocked date:', error)
      toast.error("Failed to remove blocked date")
    }
  }

  if (!blockedDates.length) {
    return (
      <Alert>
        <CalendarX className="h-4 w-4" />
        <AlertDescription>
          No blocked dates found. Click the "Block Dates" button above to block off dates in the calendar.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {blockedDates.map((block) => (
        <div
          key={block.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
        >
          <div className="space-y-1">
            <p className="font-medium">
              {format(new Date(block.start_date), "PPP")} - {format(new Date(block.end_date), "PPP")}
            </p>
            {block.reason && (
              <p className="text-sm text-muted-foreground">{block.reason}</p>
            )}
          </div>
          {isAdmin && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(block.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
