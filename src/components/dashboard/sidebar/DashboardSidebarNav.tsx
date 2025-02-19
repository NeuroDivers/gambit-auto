
import { NavLink } from "react-router-dom"
import { 
  CalendarDays, 
  ClipboardList, 
  Factory, 
  FileText, 
  Home, 
  MessagesSquare, 
  Settings, 
  Users, 
  Wrench 
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const mainMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      to: "/admin",
    },
    {
      title: "Work Orders",
      icon: Wrench,
      to: "/admin/work-orders",
    },
    {
      title: "Quotes",
      icon: MessagesSquare,
      to: "/admin/quotes",
    },
    {
      title: "Invoices",
      icon: FileText,
      to: "/admin/invoices",
    },
  ]

  const managementMenuItems = [
    {
      title: "Service Types",
      icon: Factory,
      to: "/admin/service-types",
    },
    {
      title: "Service Bays",
      icon: CalendarDays,
      to: "/admin/service-bays",
    },
    {
      title: "Clients",
      icon: ClipboardList,
      to: "/admin/clients",
    },
    {
      title: "Users",
      icon: Users,
      to: "/admin/users",
    },
  ]

  const settingsMenuItems = [
    {
      title: "Business Settings",
      icon: Settings,
      to: "/admin/business-settings",
    },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.to}
                    className={({ isActive }) => cn(
                      "w-full",
                      isActive && "text-primary"
                    )}
                    onClick={onNavigate}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {managementMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.to}
                    className={({ isActive }) => cn(
                      "w-full",
                      isActive && "text-primary"
                    )}
                    onClick={onNavigate}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {settingsMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.to}
                    className={({ isActive }) => cn(
                      "w-full",
                      isActive && "text-primary"
                    )}
                    onClick={onNavigate}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
