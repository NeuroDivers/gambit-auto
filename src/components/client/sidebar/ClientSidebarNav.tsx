
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { FileText, Calendar, User, CreditCard, MessageSquare, Car, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Dashboard",
    href: "/client",
    icon: User,
  },
  {
    title: "Quotes",
    href: "/client/quotes",
    icon: MessageSquare,
  },
  {
    title: "Invoices",
    href: "/client/invoices",
    icon: FileText,
  },
  {
    title: "Vehicles",
    href: "/client/vehicles",
    icon: Car,
  },
  {
    title: "Bookings",
    href: "/client/bookings",
    icon: Calendar,
  },
  {
    title: "Payment Methods",
    href: "/client/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/client/settings",
    icon: Settings,
  },
]

interface ClientSidebarNavProps {
  onNavigate?: () => void;
}

export function ClientSidebarNav({ onNavigate }: ClientSidebarNavProps) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-2 p-4">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}
