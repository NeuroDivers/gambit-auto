
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

// Settings items don't require permission checks except for developer settings
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

export function SidebarNav() {
  const location = useLocation()
  const { permissions } = usePermissions()
  const [allowedItems, setAllowedItems] = useState<NavItem[]>([])
  const [allowedSettingsItems, setAllowedSettingsItems] = useState<NavItem[]>([])

  useEffect(() => {
    if (!permissions) return;

    // Filter items based on permissions
    const filteredItems = allItems.filter((item) => {
      if (!item.requiredPermission) return true;
      return permissions.some(
        (p) => 
          p.resource_name === item.requiredPermission && 
          p.permission_type === 'page_access' &&
          p.is_active
      );
    });
    setAllowedItems(filteredItems);

    // Filter settings items
    const filteredSettingsItems = settingsItems.filter((item) => {
      if (!item.requiredPermission) return true;
      return permissions.some(
        (p) => 
          p.resource_name === item.requiredPermission && 
          p.permission_type === 'page_access' &&
          p.is_active
      );
    });
    setAllowedSettingsItems(filteredSettingsItems);
  }, [permissions]);

  return (
    <div className="flex flex-col gap-0.5 p-1">
      {allowedItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
            location.pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}

      {allowedSettingsItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
            location.pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </div>
  )
}
