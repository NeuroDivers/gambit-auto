
import { Sidebar, SidebarContent, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ClientSidebarNav } from "./sidebar/ClientSidebarNav"
import { ClientSidebarHeader } from "./sidebar/ClientSidebarHeader"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"

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
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const sidebarContent = (
    <SidebarContent>
      <div className="flex items-center justify-between px-4 py-2">
        <ClientSidebarHeader 
          firstName={firstName}
          role={role}
          onLogout={onLogout}
        />
        <SidebarTrigger />
      </div>
      <ClientSidebarNav onNavigate={() => setIsMobileMenuOpen(false)} />
    </SidebarContent>
  )

  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background text-foreground")}>
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
          "flex-1 p-4 transition-all duration-300 ease-in-out bg-background",
          isMobileMenuOpen ? "opacity-50" : "opacity-100"
        )}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen>
      <div className={cn("flex h-screen w-full overflow-hidden bg-background")}>
        <Sidebar>
          {sidebarContent}
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 overflow-auto p-4 bg-background">{children}</main>
      </div>
    </SidebarProvider>
  )
}
