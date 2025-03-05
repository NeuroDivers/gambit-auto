
import React, { useRef } from "react"
import { ChatMessage } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageItem } from "./MessageItem"

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  recipientId: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  firstUnreadRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  recipientId,
  scrollAreaRef,
  firstUnreadRef
}: MessageListProps) {
  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isFirstUnread = 
            !message.read_at && 
            message.sender_id === recipientId && 
            messages[index - 1]?.read_at !== undefined;

          return (
            <div
              key={message.id}
              ref={isFirstUnread ? firstUnreadRef : null}
            >
              <MessageItem 
                message={message} 
                isFromCurrentUser={message.sender_id === currentUserId}
                recipientId={recipientId}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  )
}
