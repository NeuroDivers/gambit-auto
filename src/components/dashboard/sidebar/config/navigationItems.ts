
import { 
  FileText, 
  Calendar, 
  ClipboardList, 
  MessageSquare,
  DollarSign,
  Car,
  Briefcase,
  LayoutGrid,
  Users
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
      {
        title: "Estimates",
        href: "/estimates",
        icon: FileText,
        permission: { resource: "estimates", type: "page_access" }
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
    section: "Client Management",
    items: [
      {
        title: "Clients",
        href: "/clients",
        icon: Users,
        permission: { resource: "clients", type: "page_access" }
      },
      {
        title: "Vehicles",
        href: "/vehicles",
        icon: Car,
        permission: { resource: "vehicles", type: "page_access" }
      }
    ],
  }
]
