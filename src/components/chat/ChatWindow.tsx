
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Check, Loader2, X } from "lucide-react"
import { useChatMessages } from "./hooks/useChatMessages"
import { useChatActions } from "./hooks/useChatActions"
import { getRecipientDisplayName } from "./utils/formatters"
import { MessageBubble } from "./components/MessageBubble"

export function ChatWindow({ recipientId }: { recipientId: string }) {
  const {
    messages,
    setMessages,
    messagesEndRef,
    firstUnreadRef,
    currentUserId,
    recipient,
    scrollToBottom
  } = useChatMessages(recipientId);

  const {
    newMessage,
    setNewMessage,
    editingMessageId,
    isTyping,
    inputRef,
    handleKeyDown,
    handleTyping,
    isWithinEditWindow,
    startEditing,
    cancelEditing,
    saveEdit,
    unsendMessage,
    sendMessage,
    setupTypingChannel
  } = useChatActions(messages, setMessages, currentUserId, recipientId, scrollToBottom);

  // Set up typing indicator channel
  useEffect(() => {
    if (currentUserId && recipientId) {
      return setupTypingChannel();
    }
  }, [currentUserId, recipientId]);

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{getRecipientDisplayName(recipient)}</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isFirstUnread = 
              !message.read_at && 
              message.sender_id === recipientId && 
              messages[index - 1]?.read_at !== undefined;

            const isOwnMessage = message.sender_id === currentUserId;
            const canEdit = isOwnMessage && isWithinEditWindow(message) && !message.is_deleted;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                isFirstUnread={isFirstUnread}
                canEdit={canEdit}
                onEdit={startEditing}
                onUnsend={unsendMessage}
                setRef={(el) => el && isFirstUnread && (firstUnreadRef.current = el)}
              />
            );
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
