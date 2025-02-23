
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { 
  Settings, 
  Users, 
  FileText, 
  Calendar, 
  ClipboardList, 
  Store, 
  Wrench,
  LayoutGrid 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

const items = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutGrid,
  },
  {
    title: "Estimates",
    href: "/admin/estimates",
    icon: FileText,
  },
  {
    title: "Work Orders",
    href: "/admin/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Calendar",
    href: "/admin/calendar",
    icon: Calendar,
  },
  {
    title: "Service Types",
    href: "/admin/service-types",
    icon: Wrench,
  },
  {
    title: "Service Bays",
    href: "/admin/service-bays",
    icon: Store,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <nav className="flex flex-col gap-2 p-4">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={() => onNavigate?.()}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-colors",
            location.pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isCollapsed && "justify-center py-3 px-2"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{item.title}</span>}
        </Link>
      ))}
    </nav>
  )
}
