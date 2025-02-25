
import { LucideIcon } from "lucide-react"
import { PermissionType } from "@/types/permissions"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  permission?: {
    resource: string
    type: PermissionType
  }
}

export interface NavSection {
  section: string
  items: NavItem[]
}

export interface NavSectionProps {
  section: NavSection
  isCollapsed: boolean
  onNavigate?: () => void
}
