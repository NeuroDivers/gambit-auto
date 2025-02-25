
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

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
  onLogout,
  className 
}: StaffSidebarHeaderProps) {
  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?'
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single()
      
      if (error) throw error
      return data
    }
  })

  return (
    <div className={cn("flex flex-col items-center py-4", className)}>
      {businessProfile?.light_logo_url ? (
        <img 
          src={businessProfile.light_logo_url}
          alt="Business Logo"
          className="h-16 w-auto object-contain mb-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      ) : (
        <div className="mb-4 text-2xl font-bold">Admin Panel</div>
      )}
      
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{firstName || 'Staff'}</span>
          <span className="text-xs text-muted-foreground">{role?.nicename || 'Staff'}</span>
        </div>
      </div>
      
      {onLogout && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full mt-4"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      )}
    </div>
  )
}
