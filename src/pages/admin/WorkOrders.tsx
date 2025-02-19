
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, List, Calendar as CalendarIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BlockedDatesDialog } from "@/components/work-orders/calendar/BlockedDatesDialog"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export default function WorkOrders() {
  const [view, setView] = React.useState<"list" | "calendar">("list")
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const { isAdmin } = useAdminStatus()

  // Force re-render on view change
  React.useEffect(() => {
    if (view === "calendar") {
      // Trigger re-fetch of data when switching to calendar view
      console.log("Switching to calendar view, triggering re-fetch")
    }
  }, [view])

  return (
    <div>
      <div className="space-y-6 p-6">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <ToggleGroup 
              type="single" 
              value={view} 
              onValueChange={(value) => value && setView(value as "list" | "calendar")}
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <CalendarIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            {isAdmin && <BlockedDatesDialog />}
            <Link to="/admin/work-orders/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Work Order
              </Button>
            </Link>
          </div>
        </div>
        
        {view === "list" && <WorkOrderList />}
      </div>
      
      {view === "calendar" && (
        <div className="w-full" key={view}>
          <WorkOrderCalendar />
        </div>
      )}
    </div>
  )
}
