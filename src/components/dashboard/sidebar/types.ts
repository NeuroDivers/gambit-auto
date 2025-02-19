
import { LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  requiredPermission?: string
}

export interface SidebarNavProps {
  items: NavItem[]
  className?: string
}
