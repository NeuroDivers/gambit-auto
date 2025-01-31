import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { format } from "date-fns"

export function WorkOrderCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: workOrders } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          service_bays (
            name
          ),
          quote_requests (
            first_name,
            last_name,
            vehicle_make,
            vehicle_model,
            vehicle_year
          )
        `)
      if (error) throw error
      return data
    },
  })

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white/[0.87]">Work Orders Calendar</h2>
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        className="rounded-md border"
        modifiers={{
          booked: (date) => {
            return workOrders?.some(order => {
              const start = new Date(order.start_date)
              const end = new Date(order.end_date)
              return date >= start && date <= end
            }) || false
          }
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: "rgb(14,165,233,0.2)",
            color: "rgb(14,165,233)",
            fontWeight: "bold"
          }
        }}
      />
      <CreateWorkOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />
      {workOrders?.map(order => (
        <div
          key={order.id}
          className="p-4 border rounded-lg space-y-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {order.quote_requests?.first_name} {order.quote_requests?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.quote_requests?.vehicle_year} {order.quote_requests?.vehicle_make} {order.quote_requests?.vehicle_model}
              </p>
            </div>
            <Badge>{order.status}</Badge>
          </div>
          <div className="text-sm">
            <p>Bay: {order.service_bays?.name}</p>
            <p>
              {format(new Date(order.start_date), "PPP p")} - 
              {format(new Date(order.end_date), "PPP p")}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}