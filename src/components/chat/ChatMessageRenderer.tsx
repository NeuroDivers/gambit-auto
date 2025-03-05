
import { useState } from "react";
import { ChatMessage } from "@/types/chat";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Check, Circle, MoreVertical, Pencil, Trash2, Clock } from "lucide-react";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChatMessageRendererProps {
  message: ChatMessage;
  currentUserId: string | null;
  isFirstUnread?: boolean;
  startEditing: (message: ChatMessage) => void;
  unsendMessage: (messageId: string) => void;
  isWithinEditWindow: (message: ChatMessage) => boolean;
  formatMessageTime: (timestamp: string) => string;
}

export const ChatMessageRenderer = ({
  message,
  currentUserId,
  isFirstUnread,
  startEditing,
  unsendMessage,
  isWithinEditWindow,
  formatMessageTime
}: ChatMessageRendererProps) => {
  const isOwnMessage = message.sender_id === currentUserId;
  const canEdit = isOwnMessage && isWithinEditWindow(message) && !message.is_deleted;
  const isDeleted = message.is_deleted;

  return (
    <div
      key={message.id}
      ref={isFirstUnread ? { current: null } : null}
      className={`flex ${
        message.sender_id === currentUserId ? "justify-end" : "justify-start"
      }`}
    >
      <div className="group relative flex items-start">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`rounded-lg px-4 py-2 max-w-[75%] ${
                  isDeleted 
                    ? "bg-muted/50 italic" 
                    : message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {isDeleted ? (
                    <span className="text-muted-foreground text-sm">This message was unsent</span>
                  ) : (
                    message.message
                  )}
                </div>
                {!isDeleted && (
                  <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                    {formatMessageTime(message.created_at)}
                    {message.is_edited && (
                      <span className="italic text-xs">(edited)</span>
                    )}
                    {message.sender_id !== currentUserId && (
                      message.read_at ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )
                    )}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isDeleted ? (
                `Unsent ${formatDistanceToNow(new Date(message.updated_at || message.created_at), { addSuffix: true })}`
              ) : message.read_at ? (
                `Read ${formatMessageTime(message.read_at)}`
              ) : (
                "Not read yet"
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {isOwnMessage && !isDeleted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-background"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-popover">
              {canEdit && (
                <DropdownMenuItem onClick={() => startEditing(message)} className="cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {!canEdit && !isDeleted && (
                <DropdownMenuItem disabled className="cursor-not-allowed">
                  <Clock className="h-4 w-4 mr-2" />
                  Can't edit (over 5 min)
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => unsendMessage(message.id)}
                className="text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Unsend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
