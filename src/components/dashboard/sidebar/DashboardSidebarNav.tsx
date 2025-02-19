
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const mainMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      to: "/admin",
      // Only active when exactly on /admin
      isActive: (path: string) => path === '/admin',
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

  const MenuItem = ({ item, onClick }: { item: typeof mainMenuItems[0], onClick?: () => void }) => {
    const content = (
      <NavLink 
        to={item.to}
        onClick={onClick}
        className={({ isActive }) => {
          // Use custom isActive function for dashboard, otherwise use default isActive
          const activeState = item.isActive ? 
            item.isActive(window.location.pathname) : 
            isActive

          return cn(
            "flex items-center gap-3 rounded-lg px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground min-w-0",
            activeState ? "bg-accent text-accent-foreground" : "text-foreground",
            isCollapsed && "justify-center p-2"
          )
        }}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </NavLink>
    )

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            align="center"
            className="bg-primary text-primary-foreground border-primary"
          >
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <div className="flex-1 overflow-hidden">
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <MenuItem item={item} onClick={onNavigate} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {managementMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <MenuItem item={item} onClick={onNavigate} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {settingsMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <MenuItem item={item} onClick={onNavigate} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
