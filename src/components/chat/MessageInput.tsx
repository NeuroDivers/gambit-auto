
import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTypingStatusChange?: (isTyping: boolean) => void;
}

export function MessageInput({ onSendMessage, onTypingStatusChange }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Handle typing status changes
  useEffect(() => {
    const hasText = newMessage.trim().length > 0;
    
    // Only trigger typing events when status changes
    if (hasText !== isTyping) {
      setIsTyping(hasText);
      onTypingStatusChange?.(hasText);
    }
    
    // Auto reset typing status after some inactivity
    const typingTimeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStatusChange?.(false);
      }
    }, 3000);
    
    return () => clearTimeout(typingTimeout);
  }, [newMessage, isTyping, onTypingStatusChange]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
      if (isTyping) {
        setIsTyping(false)
        onTypingStatusChange?.(false)
      }
    }
  }

  return (
    <div className="p-4 border-t flex gap-2">
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
      />
      <Button 
        onClick={handleSend}
        size="icon"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
