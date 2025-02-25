
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { 
  LayoutGrid, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Car, 
  CreditCard, 
  Settings 
} from "lucide-react"

const navigationItems = [
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
    section: "Services",
    items: [
      {
        title: "Quotes",
        href: "/quotes",
        icon: MessageSquare,
        permission: { resource: "quotes", type: "page_access" }
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText,
        permission: { resource: "invoices", type: "page_access" }
      },
      {
        title: "Chat",
        href: "/chat",
        icon: MessageSquare,
        permission: { resource: "chat", type: "page_access" }
      },
      {
        title: "Work Orders",
        href: "/work-orders",
        icon: FileText,
        permission: { resource: "work_orders", type: "page_access" }
      },
      {
        title: "Commissions",
        href: "/commissions",
        icon: FileText,
        permission: { resource: "commissions", type: "page_access" }
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        title: "Vehicles",
        href: "/vehicles",
        icon: Car,
        permission: { resource: "vehicles", type: "page_access" }
      },
      {
        title: "Bookings",
        href: "/bookings",
        icon: Calendar,
        permission: { resource: "bookings", type: "page_access" }
      },
      {
        title: "Payment Methods",
        href: "/payment-methods",
        icon: CreditCard,
        permission: { resource: "payment_methods", type: "page_access" }
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
]

interface ClientSidebarNavProps {
  onNavigate?: () => void
}

export function ClientSidebarNav({ onNavigate }: ClientSidebarNavProps) {
  const location = useLocation()
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { checkPermission } = usePermissions()
  const [filteredItems, setFilteredItems] = useState(navigationItems)

  useEffect(() => {
    const filterItems = async () => {
      const newItems = await Promise.all(
        navigationItems.map(async (section) => {
          const filteredSectionItems = await Promise.all(
            section.items.map(async (item) => {
              if (!item.permission) return item
              const hasPermission = await checkPermission(
                item.permission.resource,
                item.permission.type
              )
              console.log(`Checking permission for ${item.title}:`, hasPermission)
              return hasPermission ? item : null
            })
          )
          return {
            ...section,
            items: filteredSectionItems.filter(Boolean)
          }
        })
      )
      setFilteredItems(newItems.filter(section => section.items.length > 0))
    }

    filterItems()
  }, [checkPermission])

  const NavLink = ({ item }: { item: (typeof navigationItems)[0]["items"][0] }) => {
    const link = (
      <Link
        to={item.href}
        onClick={onNavigate}
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
    )

    if (isCollapsed && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return link
  }

  return (
    <ScrollArea className="flex-1">
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
                <NavLink key={item.href} item={item} />
              ))}
            </div>
            {index < filteredItems.length - 1 && !isCollapsed && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </nav>
    </ScrollArea>
  )
}
