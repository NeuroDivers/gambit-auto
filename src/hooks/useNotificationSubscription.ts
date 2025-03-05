
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useNotificationSubscription() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log("Setting up notification subscription...")
    
    // Get current user
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Set up notification subscription
      const notificationsChannel = supabase
        .channel('notifications-subscription')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New notification detected:', payload)
            
            // Invalidate notifications query to trigger a refresh
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            
            const notification = payload.new
            toast({
              title: notification.title,
              description: notification.message,
            })
          }
        )
        .subscribe((status) => {
          console.log("Notification subscription status:", status)
        })
      
      // Set up chat message subscription
      const chatChannel = supabase
        .channel('chat-messages-subscription')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `recipient_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New chat message detected:', payload)
            
            // Invalidate chat queries to trigger a refresh
            queryClient.invalidateQueries({ queryKey: ['chat'] })
            
            // We'll need to fetch the sender details for the toast
            const fetchSenderDetails = async () => {
              const { data } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', payload.new.sender_id)
                .single()
              
              const senderName = data?.first_name || data?.email || 'Someone'
              
              toast({
                title: "New Message",
                description: `${senderName}: ${payload.new.message.substring(0, 50)}${payload.new.message.length > 50 ? '...' : ''}`,
              })
            }
            
            fetchSenderDetails()
          }
        )
        .subscribe((status) => {
          console.log("Chat message subscription status:", status)
        })

      return () => {
        console.log("Cleaning up notification subscriptions...")
        supabase.removeChannel(notificationsChannel)
        supabase.removeChannel(chatChannel)
      }
    }
    
    const cleanup = setupSubscriptions()
    
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn()
        })
      }
    }
  }, [queryClient, toast])
}
