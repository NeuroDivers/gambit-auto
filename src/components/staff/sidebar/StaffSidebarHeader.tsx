
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface StaffSidebarHeaderProps {
  firstName?: string | null
  role?: {
    id: string
    name: string
    nicename: string
  } | null
  onLogout?: () => void
  className?: string
}

export function StaffSidebarHeader({ 
  firstName, 
  role,
  className 
}: StaffSidebarHeaderProps) {
  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?'

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{firstName || 'Staff'}</span>
        <span className="text-xs text-muted-foreground">{role?.nicename || 'Staff'}</span>
      </div>
    </div>
  )
}
