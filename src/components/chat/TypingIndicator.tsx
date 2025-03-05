
import React from "react";
import { Loader2 } from "lucide-react";

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  if (!isTyping) return null;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-pulse">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{userName ? `${userName} is typing...` : "Someone is typing..."}</span>
    </div>
  );
}
