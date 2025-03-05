
import { useState } from "react"
import { BayHeader } from "./BayHeader"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"
import { ServiceBayCard } from "./ServiceBayCard"
import { useServiceBays } from "./hooks/useServiceBays"
import { useServiceTypes } from "./hooks/useServiceTypes"

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { serviceBays, isLoading } = useServiceBays()
  const { data: availableServices } = useServiceTypes()

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center justify-center h-40 text-primary/60 text-lg">
        Loading service bays...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {serviceBays?.map((bay) => (
          <ServiceBayCard
            key={bay.id}
            bay={bay}
            services={bay.bay_services || []}
            availableServices={availableServices || []}
          />
        ))}
      </div>

      <CreateServiceBayDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
