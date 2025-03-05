
import { useState, useEffect, useRef } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useChatData } from "./useChatData"
import { useChatSubscriptions } from "./useChatSubscriptions"
import { sendNewMessage } from "./chat-utils/messageUtils"
import { updateUserTypingStatus } from "./chat-utils/presenceUtils"

export function useChatMessages(recipientId: string) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [recipientIsTyping, setRecipientIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const firstUnreadRef = useRef<HTMLDivElement>(null)

  // Scroll utility functions
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

  // Get current user
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

  // Use custom hooks for chat data and subscriptions
  const { messages, recipient, setMessages } = useChatData(
    recipientId, 
    currentUserId, 
    scrollToFirstUnread, 
    scrollToBottom
  )

  const addMessage = (message: ChatMessage) => {
    setMessages(current => [...current, message])
  }

  const { presenceChannelRef } = useChatSubscriptions(
    currentUserId,
    recipientId,
    recipient,
    addMessage,
    setRecipientIsTyping,
    scrollToBottom
  )

  // Send message function
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

    const { success, error } = await sendNewMessage(messageText, currentUserId, recipientId)

    if (!success) {
      console.error("Error sending message:", error)
      setMessages(curr => curr.filter(msg => msg.id !== newMsg.id))
    }
  }

  // Update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    await updateUserTypingStatus(presenceChannelRef.current, currentUserId, recipientId, isTyping)
  }

  return {
    messages,
    recipient,
    currentUserId,
    recipientIsTyping,
    scrollAreaRef,
    firstUnreadRef,
    sendMessage,
    updateTypingStatus
  }
}
