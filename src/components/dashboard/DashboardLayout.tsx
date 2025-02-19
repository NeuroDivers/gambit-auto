
import React from "react"
import { DashboardSidebarNav } from "./sidebar/DashboardSidebarNav"
import { DashboardSidebarHeader } from "./sidebar/DashboardSidebarHeader"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

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
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-[80] bg-background w-72 border-r">
        <DashboardSidebarHeader firstName={firstName} />
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
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-72">
        {children}
      </main>
    </div>
  )
}
