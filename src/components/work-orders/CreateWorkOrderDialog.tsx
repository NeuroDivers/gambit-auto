import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { WorkOrderForm } from "./WorkOrderForm"
import { Calendar } from "@/components/ui/calendar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CalendarDay } from "./calendar/CalendarDay"
import { cn } from "@/lib/utils"

type CreateWorkOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date
  quoteRequest?: any // We'll type this properly later
}

export function CreateWorkOrderDialog({
  open,
  onOpenChange,
  selectedDate,
  quoteRequest
}: CreateWorkOrderDialogProps) {
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
            quote_request_services (
              service_types (
                name
              )
            )
          )
        `)
      if (error) throw error
      return data
    },
  })

  const getWorkOrdersForDate = (date: Date) => {
    return workOrders?.filter(order => {
      const orderDate = new Date(order.start_date)
      return orderDate.toDateString() === date.toDateString()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-[#1a1a1a] p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              className="w-full"
              components={{
                Day: ({ date, ...props }) => (
                  <CalendarDay
                    date={date}
                    workOrders={getWorkOrdersForDate(date)}
                    {...props}
                  />
                ),
              }}
              classNames={{
                months: "w-full",
                month: "w-full",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.9rem] capitalize",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative w-full p-2 h-full border border-border rounded-lg overflow-hidden transition-colors",
                  "hover:bg-primary/10",
                  "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
                  "[&:has([aria-selected])]:bg-primary/50 [&:has([aria-selected])]:text-primary-foreground",
                  "[&:has([data-outside-month])]:opacity-50 [&:has([data-outside-month])]:pointer-events-none"
                ),
                day: "h-full w-full",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
              }}
            />
          </div>
          <div>
            <WorkOrderForm
              selectedDate={selectedDate}
              quoteRequest={quoteRequest}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}