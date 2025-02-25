
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useNotificationSubscription() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log("Setting up notification subscription...")
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification change detected:', payload)
          
          // Invalidate notifications query to trigger a refresh
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          
          if (payload.eventType === 'INSERT') {
            const notification = payload.new
            toast({
              title: notification.title,
              description: notification.message,
            })
          }
        }
      )
      .subscribe((status) => {
        console.log("Notification subscription status:", status)
      })

    return () => {
      console.log("Cleaning up notification subscription...")
      supabase.removeChannel(channel)
    }
  }, [queryClient, toast])
}
