
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { SidebarNav } from "./sidebar/SidebarNav"
import { SidebarHeader } from "./sidebar/SidebarHeader"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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

  const sidebarContent = (
    <SidebarContent className="h-full">
      <SidebarHeader 
        firstName={firstName}
        role={role}
        onLogout={onLogout}
      />
      <SidebarNav />
    </SidebarContent>
  )

  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full")}>
        <header className="border-b p-4 flex items-center justify-between bg-background">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarProvider>
                <Sidebar className="border-0 h-full">
                  {sidebarContent}
                </Sidebar>
              </SidebarProvider>
            </SheetContent>
          </Sheet>
          <div className="font-semibold">
            {firstName ? `Welcome, ${firstName}` : 'Welcome'}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className={cn("flex h-screen w-full overflow-hidden")}>
        <Sidebar>
          {sidebarContent}
        </Sidebar>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
