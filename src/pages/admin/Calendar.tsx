
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar"

export default function Calendar() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Calendar View</h1>
      <WorkOrderCalendar />
    </div>
  )
}
