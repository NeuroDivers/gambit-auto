import { Sidebar } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { Calendar, FileText, Settings, Users, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

function SidebarNav() {
  const location = useLocation()

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
  ]

  return (
    <div className="flex flex-col gap-1 p-2">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
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
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <div className="pb-12">
          <div className="space-y-4 py-4">
            <SidebarNav />
          </div>
        </div>
      </Sidebar>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}