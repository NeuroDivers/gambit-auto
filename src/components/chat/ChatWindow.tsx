
import { useState, useEffect, useRef } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { Send, Check, Circle, Loader2, Pencil, Trash2, X, Clock, MoreVertical } from "lucide-react"
import { format, formatDistanceToNow, differenceInDays, isToday, isYesterday, differenceInMinutes } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState<ChatUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const channelRef = useRef<any>(null)
  const typingChannelRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const firstUnreadRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActiveConversation = useRef<boolean>(true)

  useEffect(() => {
    isActiveConversation.current = true
    console.log("Chat window mounted, setting active conversation to true")
    
    return () => {
      isActiveConversation.current = false
      console.log("Chat window unmounted, setting active conversation to false")
    }
  }, [])

  useEffect(() => {
    isActiveConversation.current = true
    console.log("Recipient changed, setting active conversation to true for:", recipientId)
  }, [recipientId])

  const scrollToBottom = (immediate = false) => {
    if (scrollAreaRef.current && messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: immediate ? 'auto' : 'smooth'
          })
        }
      }, immediate ? 0 : 100)
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

  const isWithinEditWindow = (message: ChatMessage) => {
    const messageDate = new Date(message.created_at)
    const now = new Date()
    return differenceInMinutes(now, messageDate) <= 5
  }

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id)
    setNewMessage(message.message)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setNewMessage("")
  }

  const saveEdit = async (messageId: string) => {
    if (!newMessage.trim() || !currentUserId) return

    const messageToUpdate = messages.find(m => m.id === messageId)
    if (!messageToUpdate) return

    const originalMessage = messageToUpdate.original_message || messageToUpdate.message

    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, message: newMessage, is_edited: true, original_message: originalMessage, updated_at: new Date().toISOString() } 
          : msg
      )
    )

    const { error } = await supabase
      .from("chat_messages")
      .update({
        message: newMessage,
        is_edited: true,
        original_message: originalMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    if (error) {
      console.error("Error updating message:", error)
      toast({
        title: "Failed to update message",
        description: "Please try again",
        variant: "destructive"
      })
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? messageToUpdate : msg
        )
      )
    } else {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'message-edited',
          payload: { messageId, newText: newMessage }
        })
      }
    }

    cancelEditing()
  }

  const unsendMessage = async (messageId: string) => {
    const messageToDelete = messages.find(msg => msg.id === messageId)
    if (!messageToDelete) return
    
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, message: "This message was unsent" }
          : msg
      )
    )

    const { error } = await supabase
      .from("chat_messages")
      .update({
        is_deleted: true,
        message: "This message was unsent"
      })
      .eq('id', messageId)

    if (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Failed to unsend message",
        description: "Please try again",
        variant: "destructive"
      })
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? messageToDelete : msg
      ))
    } else {
      toast({
        title: "Message unsent",
        duration: 2000
      })
      
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'message-deleted',
          payload: { messageId }
        })
      }
    }
  }

  const fetchMessages = async () => {
    if (!currentUserId || !recipientId) return
    
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
      scrollToBottom(true)
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

    const fetchRecipient = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(id, name, nicename), avatar_url")
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
    
    if (typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current)
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
            
            const { error: updateError } = await supabase
              .from("chat_messages")
              .update({ read: true, read_at: new Date().toISOString() })
              .eq('id', newMessage.id)

            if (updateError) {
              console.error("Error marking message as read:", updateError)
            }

            const isDocumentVisible = document.visibilityState === "visible";
            
            if (!isActiveConversation.current || !isDocumentVisible) {
              console.log(`Showing toast notification - Active conversation: ${isActiveConversation.current}, Document visible: ${isDocumentVisible}`)
              toast({
                title: `${recipient?.first_name || 'New Message'}`,
                description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
                duration: 5000,
              })
            } else {
              console.log(`Not showing toast - Active conversation: ${isActiveConversation.current}, Document visible: ${isDocumentVisible}`)
            }
            
            scrollToBottom()
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages"
        },
        (payload) => {
          console.log("Message updated:", payload)
          const updatedMessage = payload.new as ChatMessage
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages"
        },
        (payload) => {
          console.log("Message deleted:", payload)
          const deletedMessageId = payload.old.id
          
          setMessages(prev => 
            prev.filter(msg => msg.id !== deletedMessageId)
          )
        }
      )
      .subscribe((status) => {
        console.log("Chat subscription status:", status)
      })

    const channelName = `typing_indicator_${[currentUserId, recipientId].sort().join('_')}`
    console.log(`Setting up typing indicator channel: ${channelName}`)
    
    typingChannelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, payload => {
        console.log("Received typing indicator:", payload)
        if (payload.typing && payload.sender_id === recipientId) {
          console.log("Setting typing indicator to true")
          setIsTyping(true)
          
          setTimeout(() => {
            console.log("Auto-clearing typing indicator")
            setIsTyping(false)
          }, 3000)
        }
      })
      .subscribe((status) => {
        console.log("Typing indicator subscription status:", status)
      })

    const handleVisibilityChange = () => {
      console.log("Document visibility changed:", document.visibilityState)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up chat subscription")
        supabase.removeChannel(channelRef.current)
      }
      if (typingChannelRef.current) {
        console.log("Cleaning up typing indicator subscription")
        supabase.removeChannel(typingChannelRef.current)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [recipientId, currentUserId, recipient?.first_name, toast])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      
      if (editingMessageId) {
        saveEdit(editingMessageId)
      } else {
        sendMessage()
      }
    } else if (e.key === 'Escape' && editingMessageId) {
      cancelEditing()
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: newMessage.trim(),
      read_at: null,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setMessages(curr => [...curr, newMsg])
    setNewMessage("")
    scrollToBottom(true)

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

  const handleTyping = () => {
    if (!currentUserId || !recipientId || !typingChannelRef.current) return
    
    console.log("User is typing, sending typing indicator")

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    typingChannelRef.current.broadcast({
      event: 'typing',
      payload: {
        typing: true,
        sender_id: currentUserId
      }
    }).then(() => {
      console.log("Typing indicator sent successfully")
    }).catch(err => {
      console.error("Error sending typing indicator:", err)
    })

    const timeout = setTimeout(() => {
      setTypingTimeout(null)
    }, 1000)

    setTypingTimeout(timeout)
  }

  const getRecipientDisplayName = () => {
    if (recipient?.first_name && recipient?.last_name) {
      return `${recipient.first_name} ${recipient.last_name}`
    }
    return recipient?.email || "Unknown User"
  }

  return (
    <Card className="flex flex-col h-full max-w-4xl mx-auto">
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

            const isOwnMessage = message.sender_id === currentUserId
            const canEdit = isOwnMessage && isWithinEditWindow(message) && !message.is_deleted
            const isDeleted = message.is_deleted

            return (
              <div
                key={message.id}
                ref={isFirstUnread ? firstUnreadRef : null}
                className={`flex ${
                  message.sender_id === recipientId ? "justify-start" : "justify-end"
                }`}
              >
                <div className="group relative flex items-start">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[75%] ${
                            isDeleted 
                              ? "bg-muted/50 italic" 
                              : message.sender_id === recipientId
                                ? "bg-muted"
                                : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {isDeleted ? (
                              <span className="text-muted-foreground text-sm">This message was unsent</span>
                            ) : (
                              message.message
                            )}
                          </div>
                          {!isDeleted && (
                            <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                              {formatMessageTime(message.created_at)}
                              {message.is_edited && (
                                <span className="italic text-xs">(edited)</span>
                              )}
                              {message.sender_id !== recipientId && (
                                message.read_at ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Circle className="h-3 w-3" />
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isDeleted ? (
                          `Unsent ${formatDistanceToNow(new Date(message.updated_at || message.created_at), { addSuffix: true })}`
                        ) : message.read_at ? (
                          `Read ${formatMessageTime(message.read_at)}`
                        ) : (
                          "Not read yet"
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {isOwnMessage && !isDeleted && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-background"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-popover">
                        {canEdit && (
                          <DropdownMenuItem onClick={() => startEditing(message)} className="cursor-pointer">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {!canEdit && !isDeleted && (
                          <DropdownMenuItem disabled className="cursor-not-allowed">
                            <Clock className="h-4 w-4 mr-2" />
                            Can't edit (over 5 min)
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => unsendMessage(message.id)}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Unsend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleTyping}
          placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
          className={editingMessageId ? "border-primary" : ""}
        />
        <Button 
          onClick={editingMessageId ? () => saveEdit(editingMessageId) : sendMessage}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {editingMessageId ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
        {editingMessageId && (
          <Button 
            onClick={cancelEditing}
            size="icon"
            variant="outline"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
