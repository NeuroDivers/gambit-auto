
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

interface DashboardSidebarHeaderProps {
  firstName?: string | null
  onLogout: () => void
}

export function DashboardSidebarHeader({
  firstName,
}: DashboardSidebarHeaderProps) {
  const { toggleSidebar, state } = useSidebar()

  return (
    <div className="flex h-16 items-center justify-between px-4 border-b">
      <div className="flex items-center gap-2">
        {state === "expanded" && (
          <span className="font-semibold">Dashboard</span>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={toggleSidebar}
      >
        {state === "expanded" ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
