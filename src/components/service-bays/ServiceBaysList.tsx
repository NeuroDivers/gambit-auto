import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceBayCard } from "./ServiceBayCard"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { BayHeader } from "./BayHeader"

type ServiceBay = {
  id: string
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  assigned_sidekick_id: string | null
}

type BayService = {
  bay_id: string
  service_id: string
  service_types: {
    id: string
    name: string
  }
}

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: serviceBays, isLoading: baysLoading } = useQuery<ServiceBay[]>({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select(`
          id,
          name,
          status,
          assigned_sidekick_id
        `)
        .order("name")

      if (error) throw error
      return data as ServiceBay[]
    },
  })

  const { data: bayServices, isLoading: servicesLoading } = useQuery<BayService[]>({
    queryKey: ["bayServices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bay_services")
        .select(`
          bay_id,
          service_id,
          service_types (
            id,
            name
          )
        `)

      if (error) throw error
      
      // Transform the data to match the BayService type
      return data.map(service => ({
        bay_id: service.bay_id,
        service_id: service.service_id,
        service_types: {
          id: service.service_types.id,
          name: service.service_types.name
        }
      })) as BayService[]
    },
  })

  const { data: availableServices, isLoading: availableServicesLoading } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, status")
        .order("name")

      if (error) throw error
      return data
    },
  })

  if (baysLoading || servicesLoading || availableServicesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceBays?.map((bay) => (
          <ServiceBayCard
            key={bay.id}
            bay={bay}
            services={bayServices
              ?.filter((service) => service.bay_id === bay.id)
              .map((service) => ({
                id: service.service_id,
                name: service.service_types.name,
                is_active: true,
              })) || []}
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