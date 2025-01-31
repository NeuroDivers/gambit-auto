import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceBayCard } from "./ServiceBayCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: serviceBays, isLoading: baysLoading } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select(`
          id,
          name,
          status
        `)
        .order("name")

      if (error) throw error
      return data
    },
  })

  const { data: bayServices, isLoading: servicesLoading } = useQuery({
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
      return data
    },
  })

  const { data: availableServices, isLoading: availableServicesLoading } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name")
        .eq("status", "active")
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white/[0.87]">Service Bays</h2>
          <p className="text-white/60">Manage your service bay availability and capabilities</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#BB86FC] hover:bg-[#BB86FC]/90 text-white transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Bay
        </Button>
      </div>

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