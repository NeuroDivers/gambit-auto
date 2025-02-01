import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { WorkOrder } from "../types"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { EditWorkOrderDialog } from "../EditWorkOrderDialog"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

const getServiceColor = (serviceName: string, index: number) => {
  // Define a set of distinct colors for different service types
  const colorSchemes = [
    {
      bg: 'rgb(14,165,233,0.2)',
      text: '#0EA5E9',
      border: 'rgb(14,165,233,0.3)'
    },
    {
      bg: 'rgb(234,179,8,0.2)',
      text: 'rgb(250,204,21)',
      border: 'rgb(234,179,8,0.3)'
    },
    {
      bg: 'rgb(234,56,76,0.2)',
      text: '#ea384c',
      border: 'rgb(234,56,76,0.3)'
    },
    {
      bg: 'rgb(155,135,245,0.2)',
      text: '#9b87f5',
      border: 'rgb(155,135,245,0.3)'
    },
    {
      bg: 'rgb(216,180,254,0.2)',
      text: '#D946EF',
      border: 'rgb(216,180,254,0.3)'
    },
    {
      bg: 'rgb(249,115,22,0.2)',
      text: '#F97316',
      border: 'rgb(249,115,22,0.3)'
    }
  ]

  // Use the index to select a color scheme, with fallback
  return colorSchemes[index % colorSchemes.length] || {
    bg: 'rgb(148,163,184,0.2)',
    text: '#94A3B8',
    border: 'rgb(148,163,184,0.3)'
  }
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  return (
    <div className={`p-2 border border-border/40 min-h-[120px] ${!isCurrentMonth && 'opacity-40'}`}>
      <div className="font-medium text-sm mb-1">
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {workOrders.map((workOrder) => {
          const mainService = workOrder.work_order_services[0]?.service_types.name || 'Other'
          const serviceIndex = 0
          const colors = getServiceColor(mainService, serviceIndex)
          
          return (
            <HoverCard key={workOrder.id}>
              <HoverCardTrigger asChild>
                <div 
                  className="text-xs bg-primary/10 p-1 rounded truncate cursor-pointer"
                >
                  <Badge 
                    variant="outline" 
                    className="text-[10px] mb-1"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border
                    }}
                  >
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
              <HoverCardContent className="w-80 p-4">
                <EditWorkOrderDialog quote={workOrder}>
                  <div className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold">{workOrder.first_name} {workOrder.last_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {workOrder.status}
                      </Badge>
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
                        <p className="text-muted-foreground">Contact</p>
                        <p>{workOrder.contact_preference === 'email' ? workOrder.email : workOrder.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Services</p>
                        <p>{workOrder.work_order_services.map(s => s.service_types.name).join(', ')}</p>
                      </div>
                    </div>
                    {workOrder.additional_notes && (
                      <div>
                        <p className="text-muted-foreground text-sm">Notes</p>
                        <p className="text-sm">{workOrder.additional_notes}</p>
                      </div>
                    )}
                  </div>
                </EditWorkOrderDialog>
              </HoverCardContent>
            </HoverCard>
          )
        })}
      </div>
    </div>
  )
}