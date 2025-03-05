
import React from "react"
import { ChatMessage } from "@/types/chat"
import { Check, Circle } from "lucide-react"
import { format, formatDistanceToNow, differenceInDays, isToday, isYesterday } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageItemProps {
  message: ChatMessage;
  isFromCurrentUser: boolean;
  recipientId: string;
}

export function MessageItem({ message, isFromCurrentUser, recipientId }: MessageItemProps) {
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

  return (
    <div className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={`rounded-lg px-4 py-2 w-full ${
                !isFromCurrentUser
                  ? "bg-muted"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <div>{message.message}</div>
              <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                {formatMessageTime(message.created_at)}
                {isFromCurrentUser && (
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
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
