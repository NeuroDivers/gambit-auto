
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { FileText, Calendar, Settings, Users, Wrench, User, Terminal, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/usePermissions"
import { useEffect, useState } from "react"
import type { NavItem } from "./types"

const allItems: NavItem[] = [
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: Wrench,
    requiredPermission: "work_orders",
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: MessageSquare,
    requiredPermission: "quotes",
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
    requiredPermission: "invoices",
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    requiredPermission: "clients",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    requiredPermission: "users",
  },
  {
    title: "Service Types",
    href: "/service-types",
    icon: Settings,
    requiredPermission: "service_types",
  },
  {
    title: "Service Bays",
    href: "/service-bays",
    icon: Calendar,
    requiredPermission: "service_bays",
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Business Settings",
    href: "/business-settings",
    icon: Settings,
    requiredPermission: "business_settings",
  },
  {
    title: "Profile Settings",
    href: "/profile-settings",
    icon: User,
  },
  {
    title: "Developer Settings",
    href: "/developer-settings",
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
  const { permissions } = usePermissions()
  const [allowedItems, setAllowedItems] = useState<NavItem[]>([])
  const [allowedSettingsItems, setAllowedSettingsItems] = useState<NavItem[]>([])

  useEffect(() => {
    console.log("Current permissions:", permissions)

    // For administrators, show all items
    if (permissions?.some(p => p.role?.name === 'administrator')) {
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
  }, [permissions])

  return (
    <nav className={cn("flex flex-col gap-2 p-4", className)}>
      <div className="space-y-2">
        {allowedItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
              "hover:bg-primary hover:text-primary-foreground",
              location.pathname === item.href 
                ? "bg-primary text-primary-foreground" 
                : "text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t space-y-2">
        {allowedSettingsItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
              "hover:bg-primary hover:text-primary-foreground",
              location.pathname === item.href 
                ? "bg-primary text-primary-foreground" 
                : "text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
