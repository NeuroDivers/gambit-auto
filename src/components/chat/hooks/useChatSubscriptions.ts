
import { useEffect, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"
import { toast } from "sonner"
import { markSingleMessageAsRead } from "./chat-utils/messageUtils"

export function useChatSubscriptions(
  currentUserId: string | null,
  recipientId: string,
  recipient: any,
  addMessage: (message: ChatMessage) => void,
  setRecipientIsTyping: (isTyping: boolean) => void,
  scrollToBottom: () => void
) {
  const channelRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)

  useEffect(() => {
    if (!currentUserId || !recipientId) return

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current)
    }

    channelRef.current = supabase
      .channel(`chat_messages_${currentUserId}_${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `recipient_id=eq.${currentUserId}`
        },
        async (payload) => {
          console.log("New message received:", payload)
          const newMessage = payload.new as ChatMessage
          
          if (newMessage.sender_id === recipientId) {
            console.log("Adding new message to chat")
            addMessage(newMessage)
            scrollToBottom()

            await markSingleMessageAsRead(newMessage.id)

            // Use sonner toast instead of shadcn/ui toast
            toast(recipient?.first_name || 'New Message', {
              description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
              duration: 5000,
            })
          }
        }
      )
      .subscribe((status) => {
        console.log("Chat subscription status:", status)
      })

    presenceChannelRef.current = supabase
      .channel(`typing_status_${currentUserId}_${recipientId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current.presenceState();
        console.log('Presence sync state:', state);
        
        const typingUsers = Object.values(state).flat() as any[];
        const isRecipientTyping = typingUsers.some(
          user => user.user_id === recipientId && 
                 user.typing === true && 
                 user.typing_to === currentUserId
        );
        
        setRecipientIsTyping(isRecipientTyping);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Presence join:', newPresences);
        
        const isRecipientTyping = newPresences.some(
          (user: any) => user.user_id === recipientId && 
                         user.typing === true && 
                         user.typing_to === currentUserId
        );
        
        if (isRecipientTyping) {
          setRecipientIsTyping(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Presence leave:', leftPresences);
        
        const wasRecipientTyping = leftPresences.some(
          (user: any) => user.user_id === recipientId && 
                         user.typing === true && 
                         user.typing_to === currentUserId
        );
        
        if (wasRecipientTyping) {
          setRecipientIsTyping(false);
        }
      })
      .subscribe((status) => {
        console.log("Typing status subscription:", status);
      });

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up chat subscription")
        supabase.removeChannel(channelRef.current)
      }
      
      if (presenceChannelRef.current) {
        console.log("Cleaning up typing status subscription")
        supabase.removeChannel(presenceChannelRef.current)
      }
    }
  }, [recipientId, currentUserId, recipient?.first_name, addMessage, scrollToBottom, setRecipientIsTyping])

  return { channelRef, presenceChannelRef }
}
