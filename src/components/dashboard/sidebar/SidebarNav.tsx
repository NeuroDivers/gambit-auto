
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

export function SidebarNav() {
  const location = useLocation()
  const { checkPermission } = usePermissions()
  const [allowedItems, setAllowedItems] = useState<NavItem[]>([])
  const [allowedSettingsItems, setAllowedSettingsItems] = useState<NavItem[]>([])

  useEffect(() => {
    const checkPermissions = async () => {
      const filteredItems = await Promise.all(
        allItems.map(async (item) => {
          if (!item.requiredPermission) return item
          const hasPermission = await checkPermission(
            item.requiredPermission,
            "page_access"
          )
          return hasPermission ? item : null
        })
      )
      setAllowedItems(filteredItems.filter((item): item is NavItem => item !== null))

      const filteredSettingsItems = await Promise.all(
        settingsItems.map(async (item) => {
          if (!item.requiredPermission) return item
          const hasPermission = await checkPermission(
            item.requiredPermission,
            "page_access"
          )
          return hasPermission ? item : null
        })
      )
      setAllowedSettingsItems(filteredSettingsItems.filter((item): item is NavItem => item !== null))
    }

    checkPermissions()
  }, [checkPermission])

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
