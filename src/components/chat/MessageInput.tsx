
import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
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
