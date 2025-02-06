import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

export interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  assigned_sidekick_id: string | null
  notes: string | null
  bay_services?: {
    service_id: string
    name: string
    is_active: boolean
  }[]
}

export function useServiceBays() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: serviceBays, isLoading, refetch } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      console.log("Fetching service bays...")
      const { data, error } = await supabase
        .from("service_bays")
        .select(`
          *,
          bay_services (
            service_id,
            is_active,
            service_types (
              id,
              name
            )
          )
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error("Error fetching service bays:", error)
        throw error
      }
      
      return data?.map(bay => ({
        ...bay,
        bay_services: bay.bay_services?.map(service => ({
          service_id: service.service_id,
          name: service.service_types.name,
          is_active: service.is_active
        })) || []
      })) || []
    },
  })

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

  return { serviceBays, isLoading }
}