
import React from "react"
import { Card } from "@/components/ui/card"
import { useChatMessages } from "./hooks/useChatMessages"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { TypingIndicator } from "./TypingIndicator"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const {
    messages,
    recipient,
    currentUserId,
    recipientIsTyping,
    scrollAreaRef, 
    firstUnreadRef,
    sendMessage,
    updateTypingStatus
  } = useChatMessages(recipientId)

  return (
    <Card className="flex flex-col h-full">
      <ChatHeader recipient={recipient} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          recipientId={recipientId}
          scrollAreaRef={scrollAreaRef}
          firstUnreadRef={firstUnreadRef}
        />
        <TypingIndicator 
          isTyping={recipientIsTyping} 
          userName={recipient?.first_name || undefined}
        />
      </div>
      <MessageInput 
        onSendMessage={sendMessage} 
        onTypingStatusChange={updateTypingStatus}
      />
    </Card>
  )
}
