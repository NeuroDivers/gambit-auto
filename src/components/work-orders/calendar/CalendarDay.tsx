import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { WorkOrder } from "../types"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

const getServiceColor = (serviceName: string) => {
  const colors: Record<string, { bg: string, text: string, border: string }> = {
    'Oil Change': { 
      bg: 'rgb(14,165,233,0.2)', 
      text: '#0EA5E9',
      border: 'rgb(14,165,233,0.3)'
    },
    'Tire Rotation': { 
      bg: 'rgb(234,179,8,0.2)', 
      text: 'rgb(250,204,21)',
      border: 'rgb(234,179,8,0.3)'
    },
    'Brake Service': { 
      bg: 'rgb(234,56,76,0.2)', 
      text: '#ea384c',
      border: 'rgb(234,56,76,0.3)'
    },
    'General Maintenance': { 
      bg: 'rgb(155,135,245,0.2)', 
      text: '#9b87f5',
      border: 'rgb(155,135,245,0.3)'
    }
  }

  return colors[serviceName] || { 
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
          const colors = getServiceColor(mainService)
          
          return (
            <div 
              key={workOrder.id}
              className="text-xs bg-primary/10 p-1 rounded truncate"
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
          )
        })}
      </div>
    </div>
  )
}