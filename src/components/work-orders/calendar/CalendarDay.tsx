import { format } from "date-fns"
import { QuoteRequest } from "../types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { EditWorkOrderDialog } from "../EditWorkOrderDialog"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { useState } from "react"

type CalendarDayProps = {
  date: Date
  quotes: QuoteRequest[]
  isCurrentMonth: boolean
}

const getServiceColor = (serviceName: string, index: number) => {
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

  return colorSchemes[index % colorSchemes.length] || {
    bg: 'rgb(148,163,184,0.2)',
    text: '#94A3B8',
    border: 'rgb(148,163,184,0.3)'
  }
}

export function CalendarDay({ date, quotes, isCurrentMonth }: CalendarDayProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <>
      <div 
        className={cn(
          "min-h-[120px] p-2 border border-border/20 rounded-md cursor-pointer transition-colors",
          !isCurrentMonth && "opacity-50 bg-background/50",
          "hover:bg-accent/50"
        )}
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <div className="font-medium text-sm mb-2">
          {format(date, 'd')}
        </div>
        <div className="space-y-1">
          {quotes.map((quote) => (
            <HoverCard key={quote.id}>
              <HoverCardTrigger asChild>
                <div 
                  className="text-xs bg-primary/10 p-1 rounded truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="outline" className="text-[10px] mb-1">
                    {quote.status}
                  </Badge>
                  <div className="truncate">
                    {quote.first_name} {quote.last_name}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {quote.vehicle_make} {quote.vehicle_model}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-80 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    const dialogElement = document.getElementById(`edit-work-order-${quote.id}`)
                    if (dialogElement) {
                      ;(dialogElement as HTMLDialogElement).showModal()
                    }
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold">{quote.first_name} {quote.last_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quote.contact_preference === 'email' ? quote.email : quote.phone_number}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p>{quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serial</p>
                      <p>{quote.vehicle_serial}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Services</p>
                      <p>{quote.work_order_services.map(s => s.service_types.name).join(', ')}</p>
                    </div>
                  </div>
                  {quote.additional_notes && (
                    <div>
                      <p className="text-muted-foreground text-sm">Notes</p>
                      <p className="text-sm">{quote.additional_notes}</p>
                    </div>
                  )}
                </div>
                <EditWorkOrderDialog quote={quote} />
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