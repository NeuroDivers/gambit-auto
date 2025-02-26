
import { 
  Settings, 
  Users, 
  FileText, 
  Calendar, 
  ClipboardList, 
  Store, 
  Wrench,
  LayoutGrid,
  Shield,
  Code,
  MessageSquare,
  DollarSign,
  Car,
  Briefcase,
  Receipt
} from "lucide-react"
import { NavSection } from "../types/navigation"

export const navigationItems: NavSection[] = [
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
        permission: { resource: "estimates", type: "page_access" }
      },
      {
        title: "Work Orders",
        href: "/work-orders",
        icon: ClipboardList,
        permission: { resource: "work_orders", type: "page_access" }
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: Receipt,
        permission: { resource: "invoices", type: "page_access" }
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
        permission: { resource: "calendar", type: "page_access" }
      },
      {
        title: "Chat",
        href: "/chat",
        icon: MessageSquare,
        permission: { resource: "chat", type: "page_access" }
      },
      {
        title: "My Skills",
        href: "/staff/service-skills",
        icon: Briefcase,
        permission: { resource: "staff_skills", type: "page_access" }
      },
      {
        title: "Commissions",
        href: "/commissions",
        icon: DollarSign,
        permission: { resource: "commissions", type: "page_access" }
      }
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
    ],
  },
  {
    section: "Administration",
    items: [
      {
        title: "Users",
        href: "/user-management",
        icon: Users,
        permission: { resource: "users", type: "page_access" }
      },
      {
        title: "Staff Skills Management",
        href: "/admin/staff-skills",
        icon: Briefcase,
        permission: { resource: "staff_skills", type: "page_access" }
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
      {
        title: "Developer Settings",
        href: "/developer-settings",
        icon: Code,
        permission: { resource: "developer_settings", type: "page_access" }
      },
    ],
  },
]
