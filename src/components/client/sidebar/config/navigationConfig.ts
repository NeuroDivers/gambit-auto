
import { 
  LayoutGrid, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Car, 
  CreditCard, 
  Settings,
  Wrench,
  Shield,
  ClipboardList,
  Briefcase
} from "lucide-react"
import { NavigationSection } from "../types"

export const navigationItems: NavigationSection[] = [
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
        title: "Work Orders",
        href: "/work-orders",
        icon: ClipboardList,
        permission: { resource: "work_orders", type: "page_access" }
      },
      {
        title: "Service Types",
        href: "/service-types",
        icon: Wrench,
        permission: { resource: "service_types", type: "page_access" }
      },
      {
        title: "My Skills",
        href: "/staff/service-skills",
        icon: Briefcase,
        permission: { resource: "staff_skills", type: "page_access" }
      },
      {
        title: "Chat",
        href: "/chat",
        icon: MessageSquare,
        permission: { resource: "chat", type: "page_access" }
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
    section: "Administration",
    items: [
      {
        title: "System Roles",
        href: "/system-roles",
        icon: Shield,
        permission: { resource: "system_roles", type: "page_access" }
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
]
