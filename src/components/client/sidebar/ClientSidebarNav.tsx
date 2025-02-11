
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { FileText, Calendar, User, CreditCard, MessageSquare } from "lucide-react"
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
    title: "Bookings",
    href: "/client/bookings",
    icon: Calendar,
  },
  {
    title: "Payment Methods",
    href: "/client/payment-methods",
    icon: CreditCard,
  },
]

export function ClientSidebarNav() {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-0.5 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
            location.pathname === item.href ? "bg-accent" : "transparent",
            "text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
