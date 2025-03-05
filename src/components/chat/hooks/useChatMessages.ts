
import { useState, useEffect, useRef } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useChatMessages(recipientId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [recipient, setRecipient] = useState<ChatUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const channelRef = useRef<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const firstUnreadRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const scrollArea = scrollAreaRef.current
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight
        }
      }, 100)
    }
  }

  const scrollToFirstUnread = () => {
    if (firstUnreadRef.current) {
      firstUnreadRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !currentUserId) return

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: messageText.trim(),
      read_at: null,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setMessages(curr => [...curr, newMsg])
    scrollToBottom()

    const { error } = await supabase
      .from("chat_messages")
      .insert([{
        sender_id: currentUserId,
        recipient_id: recipientId,
        message: messageText.trim(),
      }])

    if (error) {
      console.error("Error sending message:", error)
      setMessages(curr => curr.filter(msg => msg.id !== newMsg.id))
      return
    }
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log("Current user ID:", user.id)
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

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

      const unreadMessages = messages.filter(m => 
        m.sender_id === recipientId && 
        m.recipient_id === currentUserId && 
        !m.read
      )

      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from("chat_messages")
          .update({ read: true, read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(m => m.id))

        if (updateError) {
          console.error("Error marking messages as read:", updateError)
        }

        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("profile_id", currentUserId)
          .eq("sender_id", recipientId)
          .eq("type", 'chat_message')

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

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
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
            setMessages((current) => [...current, newMessage])
            scrollToBottom()

            const { error: updateError } = await supabase
              .from("chat_messages")
              .update({ read: true, read_at: new Date().toISOString() })
              .eq('id', newMessage.id)

            if (updateError) {
              console.error("Error marking message as read:", updateError)
            }

            // Show toast notification with the message content
            toast({
              title: `${recipient?.first_name || 'New Message'}`,
              description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
              duration: 5000,
            })
          }
        }
      )
      .subscribe((status) => {
        console.log("Chat subscription status:", status)
      })

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up chat subscription")
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [recipientId, currentUserId, recipient?.first_name, toast])

  return {
    messages,
    recipient,
    currentUserId,
    scrollAreaRef,
    firstUnreadRef,
    sendMessage
  }
}
