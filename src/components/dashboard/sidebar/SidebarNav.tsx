import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Calendar, FileText, Settings, Users, Wrench, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminStatus } from "@/hooks/useAdminStatus"

const items = [
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: Wrench,
  },
  {
    title: "Service Types",
    href: "/service-types",
    icon: Settings,
  },
  {
    title: "Service Bays",
    href: "/service-bays",
    icon: Calendar,
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: FileText,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Business Settings",
    href: "#",
    icon: Settings,
    onClick: () => document.getElementById("business-settings-trigger")?.click(),
  },
  {
    title: "Profile Settings",
    href: "#",
    icon: User,
    onClick: () => document.getElementById("profile-settings-trigger")?.click(),
  },
]

export function SidebarNav() {
  const location = useLocation()
  const { isAdmin } = useAdminStatus()

  return (
    <div className="flex flex-col gap-0.5 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={item.onClick}
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