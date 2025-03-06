
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

  const { data: serviceBays, isLoading, error, refetch } = useQuery({
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
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    retry: 3, // Retry failed queries 3 times
    initialData: () => {
      // Use any existing service bays data from the cache
      return queryClient.getQueryData(["serviceBays"]) as ServiceBay[] | undefined;
    }
  })

  useEffect(() => {
    // Handle error with toast
    if (error) {
      console.error("Service bay fetch error:", error)
      toast({
        title: "Error loading service bays",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      })
    }
  }, [error, toast])

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
  }, [refetch, toast, queryClient])

  return { 
    serviceBays: serviceBays || [], 
    isLoading,
    error,
    refetch
  }
}
