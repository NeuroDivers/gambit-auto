
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { LogOut, User } from "lucide-react"

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

  const formatName = (name: string | null | undefined) => {
    if (!name) return 'Guest'
    const nameParts = name.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[1].charAt(0)}.`
    }
    return name
  }

  if (isCollapsed) {
    return (
      <div className="p-2 space-y-2 flex flex-col items-center border-b">
        <Avatar>
          <AvatarFallback>
            {firstName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="w-8 h-8 p-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 border-b">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt={firstName || 'User'} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">
            Welcome, {formatName(firstName)}
          </h2>
          <span className="text-sm rounded-md px-2 py-1 capitalize inline-block" style={{
            color: '#bb86fc',
            background: 'rgb(187 134 252 / 0.1)',
          }}>
            {role || 'Client'} account
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={onLogout}
        className="w-full gap-2 justify-start text-muted-foreground hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}
