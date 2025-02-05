import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { Calendar, FileText, Settings, Users, Wrench, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { BusinessSettingsDialog } from "../business/BusinessSettingsDialog"
import { ProfileDialog } from "../profile/ProfileDialog"

function SidebarNav() {
  const location = useLocation()
  const { isAdmin } = useAdminStatus()

  const items = [
    {
      title: "Work Orders",
      href: "/work-orders",
      icon: Wrench,
      active: location.pathname === "/work-orders",
    },
    {
      title: "Service Types",
      href: "/service-types",
      icon: Settings,
      active: location.pathname === "/service-types",
    },
    {
      title: "Service Bays",
      href: "/service-bays",
      icon: Calendar,
      active: location.pathname === "/service-bays",
    },
    {
      title: "Quotes",
      href: "/quotes",
      icon: FileText,
      active: location.pathname === "/quotes",
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: FileText,
      active: location.pathname === "/invoices",
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      active: location.pathname === "/users",
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      active: location.pathname === "/clients",
    },
    {
      title: "Business Settings",
      href: "#",
      icon: Settings,
      active: false,
      onClick: () => document.getElementById("business-settings-trigger")?.click(),
    },
    {
      title: "Profile Settings",
      href: "#",
      icon: User,
      active: false,
      onClick: () => document.getElementById("profile-settings-trigger")?.click(),
    },
  ]

  return (
    <div className="flex flex-col gap-0.5 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={item.onClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
            item.active ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1">{children}</main>
      </div>
      <div className="hidden">
        <button id="business-settings-trigger">
          <BusinessSettingsDialog />
        </button>
        <button id="profile-settings-trigger">
          <ProfileDialog />
        </button>
      </div>
    </SidebarProvider>
  )
}