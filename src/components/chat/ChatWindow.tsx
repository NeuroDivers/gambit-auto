
import React from "react"
import { Card } from "@/components/ui/card"
import { useChatMessages } from "./hooks/useChatMessages"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const {
    messages,
    recipient,
    currentUserId,
    scrollAreaRef, 
    firstUnreadRef,
    sendMessage
  } = useChatMessages(recipientId)

  return (
    <Card className="flex flex-col h-full">
      <ChatHeader recipient={recipient} />
      <MessageList 
        messages={messages}
        currentUserId={currentUserId}
        recipientId={recipientId}
        scrollAreaRef={scrollAreaRef}
        firstUnreadRef={firstUnreadRef}
      />
      <MessageInput onSendMessage={sendMessage} />
    </Card>
  )
}
