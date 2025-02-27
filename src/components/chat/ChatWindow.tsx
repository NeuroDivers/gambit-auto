
import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { ChatMessage, ChatUser, MessageStatus } from "@/types/chat"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { 
  Send, 
  Check, 
  CheckCheck, 
  Circle, 
  Clock, 
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  X,
  ChevronDown
} from "lucide-react"
import { 
  format, 
  formatDistanceToNow, 
  differenceInDays, 
  isToday, 
  isYesterday,
  parseISO, 
  isValid,
  isSameDay
} from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingMessages, setPendingMessages] = useState<Map<string, MessageStatus>>(new Map())
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState<ChatUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const channelRef = useRef<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const firstUnreadRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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
    } else {
      scrollToBottom()
    }
  }

  const formatMessageDate = (timestamp: string) => {
    const date = parseISO(timestamp)
    if (!isValid(date)) return ''
    
    const now = new Date()
    const daysDifference = differenceInDays(now, date)

    if (daysDifference === 0 && isToday(date)) {
      return format(date, 'h:mm a')
    }
    
    if (daysDifference === 1 && isYesterday(date)) {
      return 'Yesterday ' + format(date, 'h:mm a')
    }
    
    if (daysDifference < 7) {
      return format(date, 'EEEE h:mm a')
    }
    
    return format(date, 'MMM d, yyyy h:mm a')
  }

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {}
    
    messages.forEach(message => {
      const date = parseISO(message.created_at)
      const dateKey = format(date, 'yyyy-MM-dd')
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      
      groups[dateKey].push(message)
    })
    
    return Object.entries(groups).map(([date, messages]) => {
      const firstDate = parseISO(messages[0].created_at)
      let dateLabel = ''
      
      if (isToday(firstDate)) {
        dateLabel = 'Today'
      } else if (isYesterday(firstDate)) {
        dateLabel = 'Yesterday'
      } else {
        dateLabel = format(firstDate, 'MMMM d, yyyy')
      }
      
      return { date: dateLabel, messages }
    })
  }

  const updatePresence = async () => {
    // Update last_seen_at for the current user
    if (currentUserId) {
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', currentUserId)
    }
  }

  useEffect(() => {
    updatePresence()
    
    // Set up an interval to update presence periodically
    const interval = setInterval(updatePresence, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [currentUserId])

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

    setIsLoading(true)
    setMessages([])

    const fetchMessages = async () => {
      console.log("Fetching messages between current user and recipient:", currentUserId, recipientId)
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        setIsLoading(false)
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
      
      setIsLoading(false)
    }

    const fetchRecipient = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(name, nicename), avatar_url, last_seen_at")
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
          filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId}))`
        },
        async (payload) => {
          console.log("New message received:", payload)
          const newMessage = payload.new as ChatMessage
          
          // Fetch sender information
          const { data: sender } = await supabase
            .from("profiles")
            .select("first_name, last_name, email, avatar_url")
            .eq("id", newMessage.sender_id)
            .single()
            
          const enrichedMessage = {
            ...newMessage,
            sender
          }
          
          setMessages((current) => [...current, enrichedMessage])
          scrollToBottom()

          if (newMessage.sender_id === recipientId && newMessage.recipient_id === currentUserId) {
            const { error: updateError } = await supabase
              .from("chat_messages")
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id)

            if (updateError) {
              console.error("Error marking message as read:", updateError)
            }

            // Also remove/update the typing indicator
            setIsTyping(false)
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current)
            }

            toast({
              title: "New Message",
              description: `${recipient?.first_name || 'Someone'}: ${newMessage.message.substring(0, 50)}${newMessage.message.length > 50 ? '...' : ''}`,
              duration: 5000,
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `sender_id.eq.${currentUserId}`
        },
        (payload) => {
          console.log("Message updated:", payload)
          const updatedMessage = payload.new as ChatMessage
          
          // Update read status in UI
          if (updatedMessage.read_at) {
            setMessages(current => 
              current.map(msg => 
                msg.id === updatedMessage.id ? { ...msg, read_at: updatedMessage.read_at } : msg
              )
            )
            
            // Also update pending status if needed
            if (pendingMessages.has(updatedMessage.id)) {
              setPendingMessages(current => {
                const updated = new Map(current)
                updated.set(updatedMessage.id, 'read')
                return updated
              })
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
  }, [recipientId, currentUserId, toast])

  // Setup typing indicator listener
  useEffect(() => {
    if (!currentUserId || !recipientId) return

    const typingChannel = supabase.channel(`typing_${recipientId}_${currentUserId}`)
    
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        console.log('User is typing:', payload)
        setIsTyping(true)
        
        // Auto-remove typing indicator after 3 seconds of inactivity
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, 3000)
      })
      .subscribe()
      
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      supabase.removeChannel(typingChannel)
    }
  }, [recipientId, currentUserId])

  const sendTypingIndicator = () => {
    if (!currentUserId || !recipientId) return
    
    supabase.channel(`typing_${currentUserId}_${recipientId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId }
      })
  }

  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Only send typing indicator if there's actual text
    if (e.target.value.trim().length > 0) {
      sendTypingIndicator()
    }
  }

  const sendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !currentUserId) return
    
    const tempId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const newMsg: ChatMessage = {
      id: tempId,
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: newMessage.trim(),
      read_at: null,
      created_at: now,
      updated_at: now
    }
    
    // Add message to local state with pending status
    setMessages(curr => [...curr, newMsg])
    setPendingMessages(curr => {
      const updated = new Map(curr)
      updated.set(tempId, 'sending')
      return updated
    })
    scrollToBottom()
    
    setNewMessage("")
    
    try {
      // Handle file uploads first if there are any
      let fileUrls = []
      
      if (attachments.length > 0) {
        setIsUploading(true)
        
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${crypto.randomUUID()}.${fileExt}`
          const filePath = `chat-attachments/${currentUserId}/${fileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(filePath, file)
            
          if (uploadError) {
            throw uploadError
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('public')
            .getPublicUrl(filePath)
            
          fileUrls.push({
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type
          })
        }
        
        setIsUploading(false)
      }
      
      // Update the pending status to 'sent'
      setPendingMessages(curr => {
        const updated = new Map(curr)
        updated.set(tempId, 'sent')
        return updated
      })
      
      // Now send the message
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{
          sender_id: currentUserId,
          recipient_id: recipientId,
          message: newMessage.trim(),
        }])
        .select()
        
      if (error) {
        throw error
      }
      
      // Message sent successfully
      const actualMessageId = data[0].id
      
      // If we have attachments, now link them to the message
      if (fileUrls.length > 0) {
        const attachmentPromises = fileUrls.map(fileInfo => 
          supabase.from("chat_attachments").insert({
            message_id: actualMessageId,
            file_name: fileInfo.file_name,
            file_url: fileInfo.file_url,
            file_type: fileInfo.file_type
          })
        )
        
        await Promise.all(attachmentPromises)
      }
      
      // Update the messages array with the actual message ID
      setMessages(curr => 
        curr.map(msg => msg.id === tempId ? { ...msg, id: actualMessageId } : msg)
      )
      
      // Update the pending messages map
      setPendingMessages(curr => {
        const updated = new Map(curr)
        updated.delete(tempId)
        updated.set(actualMessageId, 'delivered')
        return updated
      })
      
      // Clear attachments
      setAttachments([])
      
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Update status to error
      setPendingMessages(curr => {
        const updated = new Map(curr)
        updated.set(tempId, 'error')
        return updated
      })
      
      toast({
        title: "Error sending message",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      // Limit total attachment size (10MB)
      const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0)
      const existingSize = attachments.reduce((sum, file) => sum + file.size, 0)
      
      if (totalSize + existingSize > 10 * 1024 * 1024) {
        toast({
          title: "File size exceeded",
          description: "Total attachment size cannot exceed 10MB",
          variant: "destructive"
        })
        return
      }
      
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleRetry = (messageId: string) => {
    // Find the failed message
    const failedMessage = messages.find(m => m.id === messageId)
    if (!failedMessage) return
    
    // Remove the failed message from the UI
    setMessages(curr => curr.filter(m => m.id !== messageId))
    setPendingMessages(curr => {
      const updated = new Map(curr)
      updated.delete(messageId)
      return updated
    })
    
    // Set the message text back in the input
    setNewMessage(failedMessage.message)
  }

  const getMessageStatus = (message: ChatMessage) => {
    if (message.sender_id !== currentUserId) return null
    
    // Check if it's a pending message
    if (pendingMessages.has(message.id)) {
      return pendingMessages.get(message.id)
    }
    
    // Otherwise use the read_at status
    return message.read_at ? 'read' : 'delivered'
  }

  const getStatusIcon = (status: MessageStatus | null) => {
    if (!status) return null
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return null
    }
  }

  const getRecipientDisplayName = () => {
    if (recipient?.first_name && recipient?.last_name) {
      return `${recipient.first_name} ${recipient.last_name}`
    }
    return recipient?.email || "Unknown User"
  }

  const getRecipientStatus = () => {
    if (!recipient?.last_seen_at) return "Offline"
    
    const lastSeen = parseISO(recipient.last_seen_at)
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    
    if (lastSeen > fiveMinutesAgo) {
      return "Online"
    }
    
    return `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={recipient?.avatar_url || undefined} />
              <AvatarFallback>{getRecipientDisplayName().substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{getRecipientDisplayName()}</h3>
              <p className="text-xs text-muted-foreground flex items-center">
                {recipient?.last_seen_at && parseISO(recipient.last_seen_at) > new Date(new Date().getTime() - 5 * 60 * 1000) ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-1.5"></span>
                    Online
                  </>
                ) : (
                  getRecipientStatus()
                )}
              </p>
            </div>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Clear conversation</DropdownMenuItem>
            <DropdownMenuItem>Block user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Message area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${i % 2 === 0 ? 'bg-muted' : 'bg-primary'} rounded-lg p-3`}>
                  <Skeleton className={`h-4 w-40 ${i % 2 === 0 ? '' : 'bg-primary-foreground/30'}`} />
                  <Skeleton className={`h-4 w-32 mt-2 ${i % 2 === 0 ? '' : 'bg-primary-foreground/30'}`} />
                  <Skeleton className={`h-3 w-20 mt-2 ${i % 2 === 0 ? '' : 'bg-primary-foreground/20'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
              </div>
            ) : (
              messageGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative px-4 bg-background text-xs text-muted-foreground">
                      {group.date}
                    </div>
                  </div>
                  
                  {group.messages.map((message, index) => {
                    const isFromCurrentUser = message.sender_id === currentUserId
                    const messageStatus = getMessageStatus(message)
                    const statusIcon = getStatusIcon(messageStatus)
                    
                    // Determine if this is the first unread message
                    const isFirstUnread = 
                      !message.read_at && 
                      message.sender_id === recipientId && 
                      (index === 0 || group.messages[index - 1].read_at !== null || group.messages[index - 1].sender_id !== recipientId)
                    
                    // Determine if we should show the time separator
                    const showTimeSeparator = index === 0 || 
                      !isSameDay(parseISO(message.created_at), parseISO(group.messages[index - 1].created_at)) ||
                      parseISO(message.created_at).getTime() - parseISO(group.messages[index - 1].created_at).getTime() > 30 * 60 * 1000
                      
                    return (
                      <div key={message.id} className="space-y-2">
                        {isFirstUnread && (
                          <div 
                            ref={firstUnreadRef}
                            className="relative flex items-center justify-center py-2"
                          >
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-destructive/30"></div>
                            </div>
                            <div className="relative px-4 bg-background text-xs text-destructive font-medium">
                              Unread messages
                            </div>
                          </div>
                        )}
                      
                        <div
                          className={`flex ${
                            isFromCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    isFromCurrentUser
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  } ${messageStatus === 'error' ? 'border border-destructive' : ''}`}
                                >
                                  <div className="break-words">{message.message}</div>
                                  <div className="text-xs opacity-70 mt-1 flex items-center justify-end gap-1">
                                    {formatMessageDate(message.created_at)}
                                    {statusIcon}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {messageStatus === 'error' ? (
                                  <div>
                                    Failed to send
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="ml-2 h-auto p-0 text-xs"
                                      onClick={() => handleRetry(message.id)}
                                    >
                                      Retry
                                    </Button>
                                  </div>
                                ) : (
                                  message.read_at ? (
                                    `Read ${formatMessageDate(message.read_at)}`
                                  ) : (
                                    messageStatus === 'sending' ? "Sending..." : "Not read yet"
                                  )
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="p-2 border-t">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative bg-muted rounded p-2 flex items-center gap-2">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(index)}
                  className="ml-1 rounded-full bg-background p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="p-3 border-t flex gap-2 items-end">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleAttachClick}
          className="h-9 w-9"
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={handleMessageInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="pr-10"
            disabled={isUploading}
          />
        </div>
        <Button 
          onClick={sendMessage}
          size="icon"
          className="h-9 w-9 rounded-full"
          disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
