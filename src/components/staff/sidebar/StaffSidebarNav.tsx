
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { User, Calendar, Settings, MessageSquare, ClipboardList, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

const items = [
  {
    title: "Dashboard",
    href: "/staff",
    icon: User,
  },
  {
    title: "Work Orders",
    href: "/staff/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Estimates",
    href: "/staff/estimates",
    icon: FileText,
  },
  {
    title: "Calendar",
    href: "/staff/calendar",
    icon: Calendar,
  },
  {
    title: "Chat",
    href: "/staff/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/staff/profile-settings",
    icon: Settings,
  },
]

interface StaffSidebarNavProps {
  onNavigate?: () => void
}

export function StaffSidebarNav({ onNavigate }: StaffSidebarNavProps) {
  const location = useLocation()
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const NavLink = ({ item }: { item: typeof items[0] }) => {
    const link = (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground min-w-0",
          location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground",
          isCollapsed && "justify-center px-2"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.title}</span>}
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
          </TooltipContent>
        </Tooltip>
      )
    }

    return link
  }

  return (
    <ScrollArea className="flex-1">
      <nav className="flex flex-col gap-2 p-4">
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </ScrollArea>
  )
}
