
import { Button } from "@/components/ui/button"
import { Plus, List, Calendar as CalendarIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useState } from "react"

export default function WorkOrders() {
  const [view, setView] = useState<"list" | "calendar">("list")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "list" | "calendar")}>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view">
              <CalendarIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Link to="/admin/work-orders/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          </Link>
        </div>
      </div>
      
      {view === "list" ? (
        <WorkOrderList />
      ) : (
        <WorkOrderCalendar />
      )}
    </div>
  )
}
