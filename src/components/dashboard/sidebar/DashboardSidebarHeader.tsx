
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useTheme } from "next-themes"

interface DashboardSidebarHeaderProps {
  firstName?: string | null
  onLogout: () => void
}

export function DashboardSidebarHeader({
  firstName,
}: DashboardSidebarHeaderProps) {
  const { toggleSidebar, state } = useSidebar()
  const { theme, systemTheme } = useTheme()

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

  // For system theme, use systemTheme to determine dark/light
  const currentTheme = theme === 'system' ? systemTheme : theme
  const logoUrl = currentTheme === 'dark' 
    ? businessProfile?.dark_logo_url 
    : businessProfile?.light_logo_url

  return (
    <div className="flex h-16 items-center justify-between px-4 border-b">
      <div className="flex-1 flex items-center justify-center">
        {state === "expanded" ? (
          logoUrl ? (
            <img 
              src={logoUrl}
              alt="Business Logo"
              className="h-24 w-auto max-w-[240px] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <span className="font-semibold">Admin Panel</span>
          )
        ) : null}
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
