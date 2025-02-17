
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface SidebarHeaderProps {
  firstName?: string | null
  role?: {
    name: string
    nicename: string
  } | null
  onLogout: () => void
}

export function SidebarHeader({ firstName, role, onLogout }: SidebarHeaderProps) {
  const formatName = (name: string | null | undefined) => {
    if (!name) return 'Guest';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[1].charAt(0)}.`;
    }
    return name;
  };

  console.log('Current role:', role); // Keep this log to help debug

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
            {role?.nicename || 'Loading...'} role
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={onLogout}
        className="w-full gap-2 justify-start text-muted-foreground hover:text-primary-foreground"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}
