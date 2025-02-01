import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BayHeader } from "./BayHeader"
import { useState } from "react"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"
import { ServiceBayCard } from "./ServiceBayCard"

interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  assigned_sidekick_id: string | null
  notes: string | null
}

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: serviceBays, isLoading } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*, bay_services(service_id, is_active)")

      if (error) throw error
      return data || []
    },
  })

  const { data: availableServices } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  if (isLoading) {
    return <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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