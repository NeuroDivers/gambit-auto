
import { Sidebar, SidebarContent, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { SidebarNav } from "./sidebar/SidebarNav"
import { SidebarHeader } from "./sidebar/SidebarHeader"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  firstName?: string | null
  role?: {
    name: string
    nicename: string
  } | null
  onLogout: () => void
}

export function DashboardLayout({ 
  children, 
  firstName,
  role,
  onLogout 
}: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const sidebarContent = (
    <SidebarContent className="flex flex-col h-full">
      <div className="px-4 py-2">
        <SidebarHeader 
          firstName={firstName}
          role={role}
          onLogout={onLogout}
        />
      </div>
      <SidebarNav className="flex-1" onNavigate={() => setIsMobileMenuOpen(false)} />
      <div className="mt-auto border-t p-4">
        <SidebarTrigger size="sm" variant="ghost" className="mx-auto" />
      </div>
    </SidebarContent>
  )

  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background")}>
        <header className="border-b p-4 flex items-center justify-between sticky top-0 z-50 bg-background">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="font-semibold">
            {firstName ? `Welcome, ${firstName}` : 'Welcome'}
          </div>
        </header>

        <div className={cn(
          "fixed inset-0 bg-background z-40 transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-screen pt-16">
            {sidebarContent}
          </div>
        </div>

        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-50" : "opacity-100"
        )}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen>
      <div className={cn("flex h-screen w-full overflow-hidden")}>
        <Sidebar>
          {sidebarContent}
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </SidebarProvider>
  )
}
