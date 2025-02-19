
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
      // This makes the dashboard link active for any route starting with /admin
      isActive: (path: string) => path.startsWith('/admin'),
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
        className={({ isActive }) => {
          // Use custom isActive function for dashboard, otherwise use default isActive
          const activeState = item.isActive ? 
            item.isActive(window.location.pathname) : 
            isActive

          return cn(
            "flex items-center gap-3 rounded-lg px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            activeState ? "bg-accent text-accent-foreground" : "text-foreground",
            isCollapsed && "h-9 w-9 p-0 justify-center"
          )
        }}
        onClick={onClick}
      >
        <item.icon className={cn(
          "h-5 w-5 shrink-0",
          isCollapsed && "h-4 w-4"
        )} />
        <span className={cn(
          "truncate",
          isCollapsed && "hidden"
        )}>
          {item.title}
        </span>
      </NavLink>
    )

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
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
          <SidebarMenu>
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
          <SidebarMenu>
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
          <SidebarMenu>
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
