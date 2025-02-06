import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BayHeader } from "./BayHeader"
import { useState, useEffect } from "react"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"
import { ServiceBayCard } from "./ServiceBayCard"
import { useToast } from "@/hooks/use-toast"

interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  assigned_sidekick_id: string | null
  notes: string | null
}

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const { data: serviceBays, isLoading, refetch } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      console.log("Fetching service bays...")
      const { data, error } = await supabase
        .from("service_bays")
        .select(`
          *,
          bay_services!inner (
            service_id,
            is_active,
            service_types (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Error fetching service bays:", error)
        throw error
      }
      
      return data?.map(bay => ({
        ...bay,
        bay_services: bay.bay_services.map(service => ({
          service_id: service.service_id,
          name: service.service_types.name,
          is_active: service.is_active
        }))
      })) || []
    },
  })

  const { data: availableServices } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
  })

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('service-bays-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bays'
        },
        async (payload) => {
          console.log('Service bay change detected:', payload)
          await refetch()
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Service Bay Added",
              description: "A new service bay has been added.",
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch, toast])

  if (isLoading) {
    return <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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