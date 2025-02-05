import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarHeaderProps {
  firstName?: string | null
  role?: string | null
  onLogout: () => void
}

export function SidebarHeader({ firstName, role, onLogout }: SidebarHeaderProps) {
  return (
    <div className="p-4 space-y-4 border-b">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">
          Welcome, {firstName || 'Guest'}
        </h2>
        {role && (
          <span className="text-sm rounded-md px-2 py-1 capitalize inline-block" style={{
            color: '#bb86fc',
            background: 'rgb(187 134 252 / 0.1)',
          }}>
            {role} account
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={onLogout}
        className="w-full gap-2 justify-start text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}