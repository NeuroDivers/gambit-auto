import { Sidebar } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { Calendar, FileText, Settings, Users, Wrench } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex min-h-screen">
      <Sidebar items={items} />
      <main className="flex-1">{children}</main>
    </div>
  )
}