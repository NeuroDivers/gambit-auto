
import { Sidebar, SidebarContent, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Header } from "../shared/Header"
import { DashboardSidebarNav } from "./sidebar/DashboardSidebarNav"
import { DashboardSidebarHeader } from "./sidebar/DashboardSidebarHeader"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { ProfileCompletionDialog } from "../profile/ProfileCompletionDialog"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"

interface DashboardLayoutProps {
  firstName?: string | null
  role?: {
    id: string
    name: string
    nicename: string
  } | null
  onLogout: () => void
  children: React.ReactNode
}

export function DashboardLayout({
  firstName,
  role,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const sidebarContent = (
    <SidebarContent className="flex flex-col h-full">
      <div className="px-4 py-2">
        <DashboardSidebarHeader 
          firstName={firstName}
          role={role}
          onLogout={onLogout}
        />
      </div>
      <DashboardSidebarNav onNavigate={() => setIsMobileMenuOpen(false)} />
      <div className="mt-auto border-t p-4">
        <SidebarTrigger size="sm" variant="ghost" className="mx-auto" />
      </div>
    </SidebarContent>
  )

  const content = isMobile ? (
    <SidebarProvider>
      <div className={cn("min-h-screen w-full bg-background text-foreground")}>
        <ProfileCompletionDialog />
        <Header 
          firstName={firstName}
          role={role}
          onLogout={onLogout}
          className="flex justify-between items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </Header>

        <div className={cn(
          "fixed inset-0 bg-background z-40 transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-screen pt-16">
            {sidebarContent}
          </div>
        </div>

        <main className={cn(
          "flex-1 p-4 transition-all duration-300 ease-in-out bg-background",
          isMobileMenuOpen ? "opacity-50" : "opacity-100"
        )}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  ) : (
    <SidebarProvider>
      <div className={cn("flex h-screen w-full overflow-hidden bg-background")}
        style={{ 
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties}
      >
        <ProfileCompletionDialog />
        <Sidebar className="border-r" collapsible="icon">
          {sidebarContent}
          <SidebarRail />
        </Sidebar>
        <div className="flex-1 overflow-hidden flex flex-col">
          <Header 
            firstName={firstName}
            role={role}
            onLogout={onLogout}
          />
          <main className="flex-1 overflow-auto p-4 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )

  return content
}
