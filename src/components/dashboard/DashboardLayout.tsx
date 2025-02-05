import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { BusinessSettingsDialog } from "../business/BusinessSettingsDialog"
import { ProfileDialog } from "../profile/ProfileDialog"
import { SidebarNav } from "./sidebar/SidebarNav"
import { SidebarHeader } from "./sidebar/SidebarHeader"

interface DashboardLayoutProps {
  children: React.ReactNode
  firstName?: string | null
  role?: string | null
  onLogout: () => void
}

export function DashboardLayout({ 
  children, 
  firstName,
  role,
  onLogout 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className={cn("flex h-screen w-full overflow-hidden")}>
        <Sidebar>
          <SidebarContent>
            <SidebarHeader 
              firstName={firstName}
              role={role}
              onLogout={onLogout}
            />
            <SidebarNav />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <div className="hidden">
        <button id="business-settings-trigger">
          <BusinessSettingsDialog />
        </button>
        <button id="profile-settings-trigger">
          <ProfileDialog />
        </button>
      </div>
    </SidebarProvider>
  )
}