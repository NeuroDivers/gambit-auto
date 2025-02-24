
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
  LayoutGrid,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

const items = [
  {
    section: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
      },
    ],
  },
  {
    section: "Work Management",
    items: [
      {
        title: "Estimates",
        href: "/estimates",
        icon: FileText,
      },
      {
        title: "Work Orders",
        href: "/work-orders",
        icon: ClipboardList,
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
      },
    ],
  },
  {
    section: "Business",
    items: [
      {
        title: "Clients",
        href: "/clients",
        icon: Users,
      },
      {
        title: "Service Types",
        href: "/service-types",
        icon: Wrench,
      },
      {
        title: "Service Bays",
        href: "/service-bays",
        icon: Store,
      },
    ],
  },
  {
    section: "Administration",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: Users,
      },
      {
        title: "System Roles",
        href: "/system-roles",
        icon: Shield,
      },
      {
        title: "Settings",
        href: "/business-settings",
        icon: Settings,
      },
    ],
  },
]

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <nav className="flex flex-col gap-4 py-4">
      {items.map((section, index) => (
        <div key={section.section} className="px-3">
          {!isCollapsed && (
            <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
              {section.section}
            </h4>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => onNavigate?.()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center py-3 px-2"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
          {index < items.length - 1 && !isCollapsed && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </nav>
  )
}
