
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ClientSidebarNav } from "./sidebar/ClientSidebarNav"
import { ClientSidebarHeader } from "./sidebar/ClientSidebarHeader"

interface ClientLayoutProps {
  children: React.ReactNode
  firstName?: string | null
  role?: string | null
  onLogout: () => void
}

export function ClientLayout({ 
  children, 
  firstName,
  role,
  onLogout 
}: ClientLayoutProps) {
  return (
    <SidebarProvider>
      <div className={cn("flex h-screen w-full overflow-hidden")}>
        <Sidebar>
          <SidebarContent>
            <ClientSidebarHeader 
              firstName={firstName}
              role={role}
              onLogout={onLogout}
            />
            <ClientSidebarNav />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
