
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText,
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
      },
      {
        title: "Bookings",
        href: "/bookings",
        icon: Calendar,
      },
      {
        title: "Payment Methods",
        href: "/payment-methods",
        icon: CreditCard,
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
        {navigationItems.map((section, index) => (
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
            {index < navigationItems.length - 1 && !isCollapsed && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </nav>
    </ScrollArea>
  )
}
