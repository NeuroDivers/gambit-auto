
import { NavLink, useLocation } from "react-router-dom"
import { 
  CalendarDays, 
  ClipboardList, 
  Factory, 
  FileText, 
  Home, 
  MessagesSquare, 
  Settings, 
  Users, 
  Wrench 
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

const items = [
  {
    title: "Dashboard",
    to: "/admin",
    icon: Home,
  },
  {
    title: "Work Orders",
    to: "/admin/work-orders",
    icon: Wrench,
  },
  {
    title: "Quotes",
    to: "/admin/quotes",
    icon: MessagesSquare,
  },
  {
    title: "Invoices",
    to: "/admin/invoices",
    icon: FileText,
  },
  {
    title: "Service Types",
    to: "/admin/service-types",
    icon: Factory,
  },
  {
    title: "Service Bays",
    to: "/admin/service-bays",
    icon: CalendarDays,
  },
  {
    title: "Clients",
    to: "/admin/clients",
    icon: ClipboardList,
  },
  {
    title: "Users",
    to: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    to: "/admin/business-settings",
    icon: Settings,
  },
]

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const location = useLocation()
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const NavLink = ({ item }: { item: typeof items[0] }) => {
    const link = (
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground min-w-0",
          location.pathname === item.to ? "bg-accent text-accent-foreground" : "text-foreground",
          isCollapsed && "justify-center px-2"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </NavLink>
    )

    if (isCollapsed && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            align="center"
            className="bg-primary text-primary-foreground border-primary"
          >
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
          <NavLink key={item.to} item={item} />
        ))}
      </nav>
    </ScrollArea>
  )
}
