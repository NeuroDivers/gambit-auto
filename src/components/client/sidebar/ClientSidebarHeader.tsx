
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"

interface ClientSidebarHeaderProps {
  firstName?: string | null
  role?: string | null
  onLogout: () => void
}

export function ClientSidebarHeader({ 
  firstName, 
  role,
  onLogout 
}: ClientSidebarHeaderProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div className={cn(
      "p-4 space-y-4 border-b",
      isCollapsed && "p-2 space-y-2 flex flex-col items-center"
    )}>
      <div className={cn(
        "flex items-center gap-3",
        isCollapsed && "flex-col gap-2"
      )}>
        <Avatar>
          <AvatarFallback>
            {firstName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {firstName ?? "User"}
            </p>
            {role && (
              <p className="text-xs text-muted-foreground">
                {role}
              </p>
            )}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size={isCollapsed ? "icon" : "sm"}
        onClick={onLogout}
        className={cn(
          "w-full",
          isCollapsed && "w-8 h-8 p-0"
        )}
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span className="ml-2">Logout</span>}
      </Button>
    </div>
  )
}
