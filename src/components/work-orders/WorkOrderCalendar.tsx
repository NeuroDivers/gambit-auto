import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { CalendarDay } from "./calendar/CalendarDay"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CalendarHeader } from "./calendar/CalendarHeader"
import { useWorkOrderData } from "./calendar/useWorkOrderData"
import { cn } from "@/lib/utils"

export function WorkOrderCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<'month' | 'day'>('month')
  const { workOrders, serviceBays } = useWorkOrderData()

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const getWorkOrdersForDate = (date: Date) => {
    return workOrders?.filter(order => {
      const orderDate = new Date(order.start_date)
      return orderDate.toDateString() === date.toDateString()
    })
  }

  return (
    <div className="space-y-6 w-full">
      <CalendarHeader view={view} setView={setView} />

      {view === 'month' ? (
        <div className="rounded-lg border bg-[#1a1a1a] p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="w-full"
            components={{
              Day: ({ date, ...props }) => (
                <CalendarDay
                  date={date}
                  workOrders={getWorkOrdersForDate(date)}
                  onSelect={handleSelect}
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
      ) : (
        <div className="rounded-lg border bg-[#1a1a1a] p-4">
          <CalendarGrid
            selectedDate={selectedDate || new Date()}
            serviceBays={serviceBays}
            workOrders={workOrders}
            onSelectDate={handleSelect}
          />
        </div>
      )}

      <CreateWorkOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />
    </div>
  )
}