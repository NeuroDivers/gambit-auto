
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { NavigationItem } from "../types"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface NavLinkProps {
  item: NavigationItem
  isCollapsed: boolean
  isMobile: boolean
  unreadCount?: number
  onNavigate?: () => void
  active: boolean
}

export function NavLink({ 
  item, 
  isCollapsed, 
  isMobile, 
  unreadCount = 0,
  onNavigate,
  active
}: NavLinkProps) {
  const isChat = item.href === '/chat'
  
  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed && "justify-center py-3 px-2"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
      {isChat && unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className={cn(
            "ml-auto",
            isCollapsed && "absolute -top-1 -right-1"
          )}
        >
          {unreadCount}
        </Badge>
      )}
    </Link>
  )

  if (isCollapsed && !isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {link}
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          {item.title}
          {isChat && unreadCount > 0 && ` (${unreadCount})`}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}
