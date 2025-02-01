import { format } from "date-fns"
import { WorkOrder } from "../types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { EditWorkOrderDialog } from "../EditWorkOrderDialog"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { useState } from "react"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <>
      <div 
        className={cn(
          "min-h-[120px] p-2 border border-border/20 rounded-md cursor-pointer transition-all duration-200",
          !isCurrentMonth && "opacity-50 bg-background/50",
          "hover:border-dashed hover:border-primary/50"
        )}
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <div className="font-medium text-sm mb-2">
          {format(date, 'd')}
        </div>
        <div className="space-y-1">
          {workOrders?.map((workOrder) => (
            <HoverCard key={workOrder.id}>
              <HoverCardTrigger asChild>
                <div 
                  className="text-xs bg-primary/10 p-1 rounded truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="outline" className="text-[10px] mb-1">
                    {workOrder.status}
                  </Badge>
                  <div className="truncate">
                    {workOrder.first_name} {workOrder.last_name}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {workOrder.vehicle_make} {workOrder.vehicle_model}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-80 p-4 z-[9999]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold">
                        {workOrder.first_name} {workOrder.last_name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {workOrder.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workOrder.contact_preference === 'email' 
                        ? workOrder.email 
                        : workOrder.phone_number}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p>{workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serial</p>
                      <p>{workOrder.vehicle_serial}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Services</p>
                      <p>{workOrder.work_order_services?.map(s => s.service_types.name).join(', ')}</p>
                    </div>
                  </div>
                  {workOrder.additional_notes && (
                    <div>
                      <p className="text-muted-foreground text-sm">Notes</p>
                      <p className="text-sm">{workOrder.additional_notes}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <EditWorkOrderDialog quote={workOrder} />
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
      <CreateWorkOrderDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
}