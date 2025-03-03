
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string | React.ReactNode
  footerText?: string
  footerAction?: {
    text: string
    href: string
    onClick?: () => void
  }
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerAction,
}: AuthLayoutProps) {
  const { theme, systemTheme } = useTheme()
  const { data: businessProfile } = useQuery({
    queryKey: ['business-profile'],
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
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          {logoUrl && (
            <img 
              src={logoUrl}
              alt={businessProfile?.company_name || "Business Logo"} 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}

        {footerText && footerAction && (
          <p className="px-8 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <button
              onClick={footerAction.onClick}
              className="underline underline-offset-4 hover:text-primary"
            >
              {footerAction.text}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
