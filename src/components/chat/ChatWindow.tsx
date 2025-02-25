import { useState, useEffect, useRef } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { Send, Check, Circle } from "lucide-react"
import { format, formatDistanceToNow, differenceInDays, isToday, isYesterday } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
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

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const daysDifference = differenceInDays(now, date)

    if (daysDifference > 3) {
      return format(date, 'MMM d, yyyy')
    }

    if (daysDifference >= 1) {
      if (isYesterday(date)) {
        return 'Yesterday'
      }
      return `${daysDifference} days ago`
    }

    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true })
    }

    return format(date, 'MMM d, yyyy')
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
        !m.read_at
      )

      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from("chat_messages")
          .update({ read_at: new Date().toISOString() })
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
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id)

            if (updateError) {
              console.error("Error marking message as read:", updateError)
            }

            toast({
              title: "New Message",
              description: `${recipient?.first_name || 'Someone'}: ${newMessage.message.substring(0, 50)}${newMessage.message.length > 50 ? '...' : ''}`,
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: newMessage.trim(),
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setMessages(curr => [...curr, newMsg])
    setNewMessage("")
    scrollToBottom()

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
  }

  const getRecipientDisplayName = () => {
    if (recipient?.first_name && recipient?.last_name) {
      return `${recipient.first_name} ${recipient.last_name}`
    }
    return recipient?.email || "Unknown User"
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{getRecipientDisplayName()}</h3>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isFirstUnread = 
              !message.read_at && 
              message.sender_id === recipientId && 
              messages[index - 1]?.read_at !== undefined

            return (
              <div
                key={message.id}
                ref={isFirstUnread ? firstUnreadRef : null}
                className={`flex ${
                  message.sender_id === recipientId ? "justify-start" : "justify-end"
                }`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={`rounded-lg px-4 py-2 w-full ${
                          message.sender_id === recipientId
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div>{message.message}</div>
                        <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                          {formatMessageTime(message.created_at)}
                          {message.sender_id !== recipientId && (
                            message.read_at ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {message.read_at ? (
                        `Read ${formatMessageTime(message.read_at)}`
                      ) : (
                        "Not read yet"
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )
          })}
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
