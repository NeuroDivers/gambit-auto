
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderSubscription() {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log("Setting up real-time subscriptions...")
    const channel = supabase
      .channel('work-orders-changes')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'work_orders'
        },
        (payload) => {
          console.log('Work order updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['work-orders'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['work-orders'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bays'
        },
        (payload) => {
          console.log('Service bay updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['work-orders'] })
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      console.log("Cleaning up real-time subscriptions...")
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
