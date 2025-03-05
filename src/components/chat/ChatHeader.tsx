
import React from "react"
import { Card } from "@/components/ui/card"
import { ChatUser } from "@/types/chat"

interface ChatHeaderProps {
  recipient: ChatUser | null;
}

export function ChatHeader({ recipient }: ChatHeaderProps) {
  const getRecipientDisplayName = () => {
    if (recipient?.first_name && recipient?.last_name) {
      return `${recipient.first_name} ${recipient.last_name}`
    }
    return recipient?.email || "Unknown User"
  }

  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold">{getRecipientDisplayName()}</h3>
    </div>
  )
}
