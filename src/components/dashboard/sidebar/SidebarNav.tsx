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
]

const settingsItems = [
  {
    title: "Business Settings",
    icon: Settings,
    dialogId: "business-settings-trigger",
  },
  {
    title: "Profile Settings",
    icon: User,
    dialogId: "profile-settings-trigger",
  },
]

export function SidebarNav() {
  const location = useLocation()
  const { isAdmin } = useAdminStatus()

  const handleDialogClick = (dialogId: string) => {
    const element = document.getElementById(dialogId)
    if (element) {
      element.click()
    }
  }

  return (
    <div className="flex flex-col gap-0.5 p-1">
      {items.map((item) => (
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

      {settingsItems.map((item) => (
        <button
          key={item.dialogId}
          onClick={() => handleDialogClick(item.dialogId)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent text-left"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </button>
      ))}
    </div>
  )
}