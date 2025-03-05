
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function useNotificationSubscription() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    console.log("Setting up notification subscription...")
    
    // Get current user
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      
      // Create unique channel names with timestamp to avoid conflicts
      const timestamp = new Date().getTime()
      
      // Set up notification subscription
      const notificationsChannel = supabase
        .channel(`notifications-subscription-${timestamp}`)
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
            // Display toast notification
            console.log('Showing notification toast:', notification.title)
            toast(notification.title, {
              description: notification.message,
              duration: 5000,
            })
          }
        )
        .subscribe((status) => {
          console.log("Notification subscription status:", status)
        })
      
      // Set up chat message subscription
      const chatChannel = supabase
        .channel(`chat-messages-subscription-${timestamp}`)
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
            queryClient.invalidateQueries({ queryKey: ['unread-count'] })
            
            // We'll need to fetch the sender details for the toast
            const fetchSenderDetails = async () => {
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, email')
                  .eq('id', payload.new.sender_id)
                  .single()
                
                const senderName = data?.first_name || data?.email || 'Someone'
                
                // Display toast notification
                console.log('Showing chat message toast from:', senderName)
                toast("New Message", {
                  description: `${senderName}: ${payload.new.message.substring(0, 50)}${payload.new.message.length > 50 ? '...' : ''}`,
                  duration: 5000,
                })
              } catch (error) {
                console.error('Error fetching sender details:', error)
                // Fallback toast if we can't get sender details
                toast("New Message", {
                  description: payload.new.message.substring(0, 50) + (payload.new.message.length > 50 ? '...' : ''),
                  duration: 5000,
                })
              }
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
  }, [queryClient])

  return { userId }
}
