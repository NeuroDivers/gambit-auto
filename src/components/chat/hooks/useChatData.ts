
import { useState, useEffect } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { markMessagesAsRead } from "./chat-utils/messageUtils"

export function useChatData(
  recipientId: string, 
  currentUserId: string | null,
  scrollToFirstUnread: () => void,
  scrollToBottom: () => void
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [recipient, setRecipient] = useState<ChatUser | null>(null)

  // Fetch messages and recipient data
  useEffect(() => {
    if (!currentUserId || !recipientId) return

    const fetchMessages = async () => {
      console.log("Fetching messages between current user and recipient:", currentUserId, recipientId)
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      console.log("Fetched messages:", messages)
      setMessages(messages)

      const hasUnreadMessages = await markMessagesAsRead(messages, currentUserId, recipientId)

      if (hasUnreadMessages) {
        setTimeout(() => {
          scrollToFirstUnread()
        }, 100)
      } else {
        scrollToBottom()
      }
    }

    const fetchRecipient = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(name, nicename), avatar_url")
        .eq("id", recipientId)
        .single()

      if (error) {
        console.error("Error fetching recipient:", error)
        return
      }

      const recipientData = {
        ...profile,
        role: Array.isArray(profile.role) ? profile.role[0] : profile.role
      } as ChatUser

      setRecipient(recipientData)
    }

    fetchMessages()
    fetchRecipient()
  }, [recipientId, currentUserId, scrollToFirstUnread, scrollToBottom])

  return { messages, recipient, setMessages }
}
