import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

export interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  assigned_profile_id: string | null
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

      if (error) {
        console.error("Error fetching service bays:", error)
        throw error
      }
      
      const formattedBays = data?.map(bay => ({
        ...bay,
        bay_services: bay.bay_services?.map(service => ({
          service_id: service.service_id,
          name: service.service_types.name,
          is_active: service.is_active
        })) || []
      })) || [];

      // Sort bays numerically then alphabetically
      return formattedBays.sort((a, b) => {
        const aMatch = a.name.match(/^(\d+)/);
        const bMatch = b.name.match(/^(\d+)/);
        
        // If both have numeric prefixes, sort by number
        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1], 10);
          const bNum = parseInt(bMatch[1], 10);
          if (aNum !== bNum) {
            return aNum - bNum;
          }
        }
        
        // If only one has a numeric prefix, put it first
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        
        // Otherwise sort alphabetically
        return a.name.localeCompare(b.name);
      });
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
