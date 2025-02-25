
import { WorkOrderCalendar } from "@/components/work-orders/calendar/WorkOrderCalendar"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function Bookings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
      </div>
      <WorkOrderCalendar clientView={true} />
    </div>
  )
}
