
import { useState, useEffect, useRef } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { Send } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState<ChatUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const channelRef = useRef<any>(null)
  const { toast } = useToast()

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
    if (!currentUserId) return

    const fetchMessages = async () => {
      console.log("Fetching messages between current user and recipient:", currentUserId, recipientId)
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      setMessages(messages)

      // Mark messages as read when they are from the recipient
      await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("sender_id", recipientId)
        .eq("recipient_id", currentUserId)

      // Update notification as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("profile_id", currentUserId)
        .eq("sender_id", recipientId)
        .eq("type", 'chat_message')
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

    // Clean up previous subscription if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Subscribe to new messages
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
          
          // Only update messages if it's part of this conversation
          if (newMessage.sender_id === recipientId) {
            console.log("Adding new message to chat")
            setMessages((current) => [...current, newMessage])

            // Show toast notification immediately when message is received
            toast({
              title: "New Message",
              description: `${recipient?.first_name || 'Someone'}: ${newMessage.message.substring(0, 50)}${newMessage.message.length > 50 ? '...' : ''}`,
              duration: 5000, // Show for 5 seconds
            })

            // Create a notification with all required fields
            const notificationData = {
              profile_id: currentUserId,
              sender_id: newMessage.sender_id,
              type: 'chat_message',
              title: 'New Message',
              message: `New message from ${recipient?.first_name || 'someone'}`,
              read: false,
              data: {
                messageId: newMessage.id,
                senderId: newMessage.sender_id,
                senderName: recipient?.first_name,
                messagePreview: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
                timestamp: new Date().toISOString()
              }
            }

            const { error: notificationError } = await supabase
              .from("notifications")
              .insert([notificationData])

            if (notificationError) {
              console.error("Error creating notification:", notificationError)
            }
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: newMessage.trim(),
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setMessages(curr => [...curr, newMsg])
    
    const { error } = await supabase
      .from("chat_messages")
      .insert([{
        sender_id: currentUserId,
        recipient_id: recipientId,
        message: newMessage.trim(),
      }])

    if (error) {
      console.error("Error sending message:", error)
      setMessages(curr => curr.filter(msg => msg.id !== newMsg.id))
      return
    }

    setNewMessage("")
  }

  const getRecipientDisplayName = () => {
    if (recipient?.first_name && recipient?.last_name) {
      return `${recipient.first_name} ${recipient.last_name}`
    }
    return recipient?.email || "Unknown User"
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{getRecipientDisplayName()}</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === recipientId ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] ${
                  message.sender_id === recipientId
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div>{message.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
        />
        <Button 
          onClick={sendMessage}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
