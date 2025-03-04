
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, List, Calendar as CalendarIcon, Wrench, Clock, CheckCircle, Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BlockedDatesDialog } from "@/components/work-orders/calendar/BlockedDatesDialog"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function WorkOrders() {
  const [view, setView] = React.useState<"list" | "calendar">("list")
  const { isAdmin } = useAdminStatus()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['workOrderStats'],
    queryFn: async () => {
      console.log("Fetching work order statistics...")
      const { data, error } = await supabase
        .from('work_order_statistics')
        .select('*')
        .single()
      
      if (error) {
        console.error("Error fetching work order statistics:", error)
        toast.error("Failed to load work order statistics")
        throw error
      }

      return data
    }
  })

  // Show loading state
  const loadingValue = <div className="animate-pulse bg-muted h-8 w-20 rounded" />

  return (
    <div>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">Work Orders</h1>
            <div className="flex flex-wrap items-center gap-4">
              <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "list" | "calendar")}>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="calendar" aria-label="Calendar view">
                  <CalendarIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              {isAdmin && <BlockedDatesDialog />}
              <Link to="/work-orders/create" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  New Work Order
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? loadingValue : stats?.total_work_orders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? loadingValue : `${stats?.completed_work_orders || 0} completed`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? loadingValue : stats?.in_progress_work_orders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active work orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading 
                    ? loadingValue 
                    : stats?.total_work_orders 
                      ? `${Math.round((stats.completed_work_orders / stats.total_work_orders) * 100)}%`
                      : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Bays</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading 
                    ? loadingValue 
                    : `${stats?.active_bays || 0}/${stats?.total_bays || 0}`
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Active / Total bays
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {view === "list" && <WorkOrderList />}
      </div>
      
      {view === "calendar" && (
        <div className="w-full">
          <WorkOrderCalendar />
        </div>
      )}
    </div>
  )
}
