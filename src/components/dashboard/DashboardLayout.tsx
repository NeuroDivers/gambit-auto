
import React from "react"
import { DashboardSidebarNav } from "./sidebar/DashboardSidebarNav"
import { DashboardSidebarHeader } from "./sidebar/DashboardSidebarHeader"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { Header } from "../shared/Header"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  firstName?: string | null
  onLogout: () => void
}

export function DashboardLayout({
  children,
  firstName,
  onLogout
}: DashboardLayoutProps) {
  const { toggleSidebar, state } = useSidebar()

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-[80] bg-background border-r",
        state === "expanded" ? "w-72" : "w-[72px]",
        "transition-all duration-300"
      )}>
        <DashboardSidebarHeader 
          firstName={firstName} 
          onLogout={onLogout}
        />
        <div className="space-y-4 flex-1 py-4">
          <DashboardSidebarNav />
        </div>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2" 
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {state === "expanded" && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 flex flex-col",
        state === "expanded" ? "lg:pl-72" : "lg:pl-[72px]",
        "transition-all duration-300"
      )}>
        <Header 
          firstName={firstName}
          onLogout={onLogout}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </Header>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
