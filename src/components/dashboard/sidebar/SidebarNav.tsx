import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { FileText, Calendar, Settings, Users, Wrench, User, Terminal, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/usePermissions"
import { useEffect, useState } from "react"
import type { NavItem } from "./types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

const allItems: NavItem[] = [
  {
    title: "Work Orders",
    href: "/admin/work-orders",
    icon: Wrench,
    requiredPermission: "work_orders",
  },
  {
    title: "Quotes",
    href: "/admin/quotes",
    icon: MessageSquare,
    requiredPermission: "quotes",
  },
  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
    requiredPermission: "invoices",
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
    requiredPermission: "clients",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    requiredPermission: "users",
  },
  {
    title: "Service Types",
    href: "/admin/service-types",
    icon: Settings,
    requiredPermission: "service_types",
  },
  {
    title: "Service Bays",
    href: "/admin/service-bays",
    icon: Calendar,
    requiredPermission: "service_bays",
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Business Settings",
    href: "/admin/business-settings",
    icon: Settings,
    requiredPermission: "business_settings",
  },
  {
    title: "Profile Settings",
    href: "/admin/profile-settings",
    icon: User,
  },
  {
    title: "Developer Settings",
    href: "/admin/developer-settings",
    icon: Terminal,
    requiredPermission: "developer_settings",
  },
]

interface SidebarNavProps {
  className?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ className, onNavigate }: SidebarNavProps) {
  const location = useLocation()
  const { permissions, currentUserRole } = usePermissions()
  const [allowedItems, setAllowedItems] = useState<NavItem[]>([])
  const [allowedSettingsItems, setAllowedSettingsItems] = useState<NavItem[]>([])
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  useEffect(() => {
    console.log("Current permissions:", permissions)
    console.log("Current user role:", currentUserRole)

    if (currentUserRole?.name?.toLowerCase() === 'administrator') {
      console.log("User is admin, showing all items")
      setAllowedItems(allItems)
      setAllowedSettingsItems(settingsItems)
      return
    }

    const filteredItems = allItems.filter((item) => {
      if (!item.requiredPermission) return true
      if (!permissions) return false
      
      const hasPermission = permissions.some(
        (p) => 
          p.resource_name === item.requiredPermission && 
          p.permission_type === 'page_access' &&
          p.is_active
      )
      
      console.log(`Checking permission for ${item.title}:`, hasPermission)
      return hasPermission
    })
    
    console.log("Filtered main items:", filteredItems)
    setAllowedItems(filteredItems)

    const filteredSettingsItems = settingsItems.filter((item) => {
      if (!item.requiredPermission) return true
      if (!permissions) return false
      
      return permissions.some(
        (p) => 
          p.resource_name === item.requiredPermission && 
          p.permission_type === 'page_access' &&
          p.is_active
      )
    })
    
    console.log("Filtered settings items:", filteredSettingsItems)
    setAllowedSettingsItems(filteredSettingsItems)
  }, [permissions, currentUserRole])

  const NavLink = ({ item }: { item: NavItem }) => {
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
    <ScrollArea className={cn("flex-1", className)}>
      <nav className="flex flex-col gap-2 p-4">
        <div className="space-y-2">
          {allowedItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          {allowedSettingsItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>
    </ScrollArea>
  )
}
