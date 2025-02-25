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
import { usePermissions } from "@/hooks/usePermissions"
import { useEffect, useState } from "react"
import { PermissionType } from "@/types/permissions"

interface NavItem {
  title: string;
  href: string;
  icon: any;
  permission?: {
    resource: string;
    type: PermissionType;
  };
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

const items: NavSection[] = [
  {
    section: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
        permission: { resource: "dashboard", type: "page_access" }
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
        permission: { resource: "quotes", type: "page_access" }
      },
      {
        title: "Work Orders",
        href: "/work-orders",
        icon: ClipboardList,
        permission: { resource: "work_orders", type: "page_access" }
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
        permission: { resource: "calendar", type: "page_access" }
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
        permission: { resource: "clients", type: "page_access" }
      },
      {
        title: "Service Types",
        href: "/service-types",
        icon: Wrench,
        permission: { resource: "service_types", type: "page_access" }
      },
      {
        title: "Service Bays",
        href: "/service-bays",
        icon: Store,
        permission: { resource: "service_bays", type: "page_access" }
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
        permission: { resource: "users", type: "page_access" }
      },
      {
        title: "System Roles",
        href: "/system-roles",
        icon: Shield,
        permission: { resource: "users", type: "page_access" }
      },
      {
        title: "Settings",
        href: "/business-settings",
        icon: Settings,
        permission: { resource: "business_settings", type: "page_access" }
      },
    ],
  },
]

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { checkPermission, currentUserRole } = usePermissions()
  const [filteredItems, setFilteredItems] = useState(items)

  useEffect(() => {
    const filterItems = async () => {
      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        setFilteredItems(items);
        return;
      }

      const newItems = await Promise.all(items.map(async (section) => {
        const filteredSectionItems = await Promise.all(
          section.items.map(async (item) => {
            if (!item.permission) return item;
            const hasPermission = await checkPermission(
              item.permission.resource,
              item.permission.type
            );
            return hasPermission ? item : null;
          })
        );
        
        return {
          ...section,
          items: filteredSectionItems.filter(Boolean)
        };
      }));
      
      setFilteredItems(newItems.filter(section => section.items.length > 0));
    };

    filterItems();
  }, [checkPermission, currentUserRole]);

  return (
    <nav className="flex flex-col gap-4 py-4">
      {filteredItems.map((section, index) => (
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
          {index < filteredItems.length - 1 && !isCollapsed && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </nav>
  )
}
