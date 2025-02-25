
import { useState, useEffect } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { Send } from "lucide-react"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState<ChatUser | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      setMessages(messages)
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

      // Ensure the role field is properly structured
      const recipientData = {
        ...profile,
        role: Array.isArray(profile.role) ? profile.role[0] : profile.role
      } as ChatUser

      setRecipient(recipientData)
    }

    fetchMessages()
    fetchRecipient()

    // Subscribe to new messages
    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [recipientId])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // First add the message locally for immediate feedback
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      recipient_id: recipientId,
      message: newMessage.trim(),
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setMessages(curr => [...curr, newMsg])
    
    // Then send to the server
    const { error } = await supabase
      .from("chat_messages")
      .insert([{
        sender_id: user.id,
        recipient_id: recipientId,
        message: newMessage.trim(),
      }])

    if (error) {
      console.error("Error sending message:", error)
      // Remove the message if it failed to send
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
                {message.message}
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
