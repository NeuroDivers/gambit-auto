
import { useState, useEffect, useRef } from "react"
import { ChatMessage, ChatUser } from "@/types/chat"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { Send, Check, Circle, Loader2, Pencil, Trash2, X, Clock } from "lucide-react"
import { format, formatDistanceToNow, differenceInDays, isToday, isYesterday, differenceInMinutes } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState<ChatUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedMessageText, setEditedMessageText] = useState("")
  const channelRef = useRef<any>(null)
  const typingChannelRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const firstUnreadRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Track if this component is currently mounted/visible
  const isActiveConversation = useRef<boolean>(true)

  useEffect(() => {
    // Set the active status when the component mounts
    isActiveConversation.current = true
    console.log("Chat window mounted, setting active conversation to true")
    
    // Clean up when component unmounts
    return () => {
      isActiveConversation.current = false
      console.log("Chat window unmounted, setting active conversation to false")
    }
  }, [])

  // Make sure to update active status when recipient changes
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

  // Check if message is within edit window (5 minutes)
  const isWithinEditWindow = (message: ChatMessage) => {
    const messageDate = new Date(message.created_at)
    const now = new Date()
    return differenceInMinutes(now, messageDate) <= 5
  }

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id)
    setEditedMessageText(message.message)
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setEditedMessageText("")
  }

  const saveEdit = async (messageId: string) => {
    if (!editedMessageText.trim() || !currentUserId) return

    const messageToUpdate = messages.find(m => m.id === messageId)
    if (!messageToUpdate) return

    // Store original message if this is the first edit
    const originalMessage = messageToUpdate.original_message || messageToUpdate.message

    // Update message locally
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, message: editedMessageText, is_edited: true, original_message: originalMessage, updated_at: new Date().toISOString() } 
          : msg
      )
    )

    // Update message in database
    const { error } = await supabase
      .from("chat_messages")
      .update({
        message: editedMessageText,
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
      // Revert to original message if update fails
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? messageToUpdate : msg
        )
      )
    } else {
      // Broadcast update to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'message-edited',
          payload: { messageId, newText: editedMessageText }
        })
      }
    }

    // Reset editing state
    cancelEditing()
  }

  const unsendMessage = async (messageId: string) => {
    // Delete message locally
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId))

    // Delete message from database
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Failed to unsend message",
        description: "Please try again",
        variant: "destructive"
      })
      // Refetch messages if delete fails
      fetchMessages()
    } else {
      toast({
        title: "Message unsent",
        duration: 2000
      })
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

            // Check document visibility
            const isDocumentVisible = document.visibilityState === "visible";
            
            // Only show toast if:
            // 1. This is NOT the currently active conversation, OR
            // 2. The document is not visible (user is on another tab/app)
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
          
          // Update local messages state
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
          
          // Remove deleted message from local state
          setMessages(prev => 
            prev.filter(msg => msg.id !== deletedMessageId)
          )
        }
      )
      .subscribe((status) => {
        console.log("Chat subscription status:", status)
      })

    // Setup typing indicator channel
    // Use a standardized channel name format that's the same for both participants
    const channelName = `typing_indicator_${[currentUserId, recipientId].sort().join('_')}`
    console.log(`Setting up typing indicator channel: ${channelName}`)
    
    typingChannelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, payload => {
        console.log("Received typing indicator:", payload)
        if (payload.typing && payload.sender_id === recipientId) {
          console.log("Setting typing indicator to true")
          setIsTyping(true)
          
          // Auto-clear typing indicator after 3 seconds if no new typing events
          setTimeout(() => {
            console.log("Auto-clearing typing indicator")
            setIsTyping(false)
          }, 3000)
        }
      })
      .subscribe((status) => {
        console.log("Typing indicator subscription status:", status)
      })

    // Document visibility change handler - BUT don't change the active conversation status
    // We only use this to determine if toasts should be shown
    const handleVisibilityChange = () => {
      console.log("Document visibility changed:", document.visibilityState)
      // We do NOT update isActiveConversation here, it should only be updated based on component mounting/unmounting
      // or recipient changes
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

  // Ensure scrolling to bottom when new messages come in
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

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

    // Send typing indicator using broadcast
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && editingMessageId) {
      cancelEditing()
    }
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

            const isOwnMessage = message.sender_id === currentUserId
            const canEdit = isOwnMessage && isWithinEditWindow(message)
            const isEditing = editingMessageId === message.id

            return (
              <div
                key={message.id}
                ref={isFirstUnread ? firstUnreadRef : null}
                className={`flex ${
                  message.sender_id === recipientId ? "justify-start" : "justify-end"
                }`}
              >
                {isEditing ? (
                  <div className="w-3/4 space-y-2">
                    <Textarea 
                      value={editedMessageText}
                      onChange={(e) => setEditedMessageText(e.target.value)}
                      className="min-h-[80px]"
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => saveEdit(message.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <div className="group relative">
                        <TooltipTrigger asChild>
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[75%] ${
                              message.sender_id === recipientId
                                ? "bg-muted"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{message.message}</div>
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
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {message.read_at ? (
                            `Read ${formatMessageTime(message.read_at)}`
                          ) : (
                            "Not read yet"
                          )}
                        </TooltipContent>
                      </div>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {isOwnMessage && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => startEditing(message)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {!canEdit && (
                        <DropdownMenuItem disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Can't edit (over 5 min)
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => unsendMessage(message.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Unsend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          onKeyUp={handleTyping}
          placeholder="Type a message..."
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
