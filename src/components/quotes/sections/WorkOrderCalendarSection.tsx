import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar"

export function WorkOrderCalendarSection() {
  return (
    <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Bay Availability</h3>
        <WorkOrderCalendar />
      </div>
    </section>
  )
}