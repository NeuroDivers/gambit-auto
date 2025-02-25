
import { LucideIcon } from "lucide-react"
import { Permission } from "@/types/permissions"

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
}

export interface NavigationSection {
  section: string;
  items: NavigationItem[];
}
