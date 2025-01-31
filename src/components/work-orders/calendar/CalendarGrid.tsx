import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ServiceBay } from "../types"
import type { WorkOrder } from "../types"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CalendarGridProps {
  selectedDate: Date
  serviceBays?: ServiceBay[]
  workOrders?: WorkOrder[]
  onSelectDate?: (date: Date) => void
}

export function CalendarGrid({ selectedDate, serviceBays = [], workOrders = [], onSelectDate }: CalendarGridProps) {
  // Generate time slots from 9 AM to 6 PM
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const getWorkOrdersForBayAndTime = (bayId: string, timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0])
    return workOrders.filter(order => {
      const orderStartHour = new Date(order.start_date).getHours()
      const orderEndHour = new Date(order.end_date).getHours()
      return order.assigned_bay_id === bayId && 
             orderStartHour <= hour && 
             orderEndHour > hour
    })
  }

  const handleTimeSlotClick = (time: string) => {
    if (!onSelectDate) return
    
    const [hours] = time.split(':')
    const newDate = new Date(selectedDate)
    newDate.setHours(parseInt(hours), 0, 0, 0)
    onSelectDate(newDate)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="grid grid-cols-[100px,repeat(auto-fill,minmax(200px,1fr))] gap-0">
          {/* Header row with bay names */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2">
            Time
          </div>
          {serviceBays.map(bay => (
            <div 
              key={bay.id}
              className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-l p-2 text-center font-medium"
            >
              {bay.name}
            </div>
          ))}

          {/* Time slots and work orders */}
          {timeSlots.map(time => (
            <>
              <div 
                key={time} 
                className="border-b p-2 text-sm text-muted-foreground"
                onClick={() => handleTimeSlotClick(time)}
              >
                {time}
              </div>
              {serviceBays.map(bay => {
                const slotWorkOrders = getWorkOrdersForBayAndTime(bay.id, time)
                return (
                  <div 
                    key={`${bay.id}-${time}`}
                    className={cn(
                      "border-b border-l p-2 min-h-[60px] transition-colors",
                      "hover:bg-accent/50 cursor-pointer",
                      slotWorkOrders.length > 0 ? "bg-accent/20" : ""
                    )}
                    onClick={() => handleTimeSlotClick(time)}
                  >
                    {slotWorkOrders.map(order => (
                      <HoverCard key={order.id}>
                        <HoverCardTrigger asChild>
                          <div 
                            className={cn(
                              "text-xs p-1 rounded text-left mb-1 truncate",
                              "bg-primary/20 hover:bg-primary/30 transition-colors",
                              "border border-primary/20"
                            )}
                          >
                            {order.quote_requests?.first_name} {order.quote_requests?.last_name} - 
                            {order.quote_requests?.quote_request_services?.[0]?.service_types.name}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent 
                          className="w-80"
                          align="start"
                        >
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {order.quote_requests?.first_name} {order.quote_requests?.last_name}
                            </p>
                            <p className="text-sm">
                              {format(new Date(order.start_date), 'h:mm a')} - 
                              {format(new Date(order.end_date), 'h:mm a')}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {order.quote_requests?.quote_request_services?.map(service => 
                                service.service_types.name
                              ).join(', ')}
                            </div>
                            {order.notes && (
                              <p className="text-xs mt-2 text-muted-foreground">
                                {order.notes}
                              </p>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}