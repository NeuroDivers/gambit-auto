
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { supabase } from "@/integrations/supabase/client"

export default function ChatClear() {
  const navigate = useNavigate()

  useEffect(() => {
    const clearChatAndRedirect = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          toast.error('Not authenticated')
          navigate('/auth', { replace: true })
          return
        }
        
        // Delete messages older than 14 days for the current user
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        
        const { error } = await supabase
          .from("chat_messages")
          .delete()
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .lt('created_at', twoWeeksAgo.toISOString())

        if (error) {
          throw error
        }
        
        // Show success toast
        toast.success('Chat history cleared successfully', {
          description: 'Messages older than 14 days have been removed'
        })
        
        // Redirect back to chat after a brief delay
        setTimeout(() => {
          navigate('/chat', { replace: true })
        }, 1500)
      } catch (error) {
        console.error('Error clearing chat history:', error)
        toast.error('Failed to clear chat history', {
          description: 'Please try again or contact support'
        })
        
        // Still redirect to chat page after a longer delay
        setTimeout(() => {
          navigate('/chat', { replace: true })
        }, 2000)
      }
    }

    clearChatAndRedirect()
  }, [navigate])

  return <LoadingScreen />
}
