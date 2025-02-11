
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Calendar, FileText, Settings, Users, Wrench, User, Terminal } from "lucide-react"
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
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
    requiredPermission: "invoices",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    requiredPermission: "users",
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    requiredPermission: "clients",
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: FileText,
    requiredPermission: "quotes",
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Business Settings",
    href: "/business-settings",
    icon: Settings,
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
}

export function SidebarNav({ className }: SidebarNavProps) {
  const location = useLocation()
  const { permissions } = usePermissions()
  const [allowedItems, setAllowedItems] = useState<NavItem[]>([])
  const [allowedSettingsItems, setAllowedSettingsItems] = useState<NavItem[]>([])

  useEffect(() => {
    console.log("Current permissions:", permissions); // Debug log

    const filteredItems = allItems.filter((item) => {
      if (!item.requiredPermission) return true;
      
      // If no permissions are loaded yet, don't show restricted items
      if (!permissions) return false;
      
      const hasPermission = permissions.some(
        (p) => 
          p.resource_name === item.requiredPermission && 
          p.permission_type === 'page_access' &&
          p.is_active
      );
      
      console.log(`Checking permission for ${item.title}:`, hasPermission); // Debug log
      return hasPermission;
    });
    
    console.log("Filtered main items:", filteredItems); // Debug log
    setAllowedItems(filteredItems);

    const filteredSettingsItems = settingsItems.filter((item) => {
      if (!item.requiredPermission) return true;
      if (!permissions) return false;
      
      return permissions.some(
        (p) => 
          p.resource_name === item.requiredPermission && 
          p.permission_type === 'page_access' &&
          p.is_active
      );
    });
    
    console.log("Filtered settings items:", filteredSettingsItems); // Debug log
    setAllowedSettingsItems(filteredSettingsItems);
  }, [permissions]);

  return (
    <nav className={cn("flex flex-col gap-2 p-4 h-full overflow-y-auto", className)}>
      <div className="space-y-2">
        {allowedItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent",
              location.pathname === item.href ? "bg-accent" : "transparent",
              "text-foreground"
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
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent",
              location.pathname === item.href ? "bg-accent" : "transparent",
              "text-foreground"
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
