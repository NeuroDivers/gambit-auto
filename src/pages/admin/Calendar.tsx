
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export default function Calendar() {
  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-white">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarDays className="h-6 w-6 text-primary" />
            Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage appointments and work orders using the calendar view below.
          </p>
        </CardContent>
      </Card>
      
      <WorkOrderCalendar />
    </div>
  )
}
