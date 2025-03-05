
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { applyThemeClass } from "@/lib/utils"

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
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load saved theme on initial mount
  useEffect(() => {
    setMounted(true)
    // Try to load theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      console.log("Auth layout: Loading saved theme:", savedTheme)
      setTheme(savedTheme)
    }
  }, [setTheme])

  // Determine if dark mode is active
  useEffect(() => {
    if (!mounted) return
    
    // Apply theme class for immediate effect
    applyThemeClass(theme, resolvedTheme)
    
    // Check if the HTML element has the dark class
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkTheme(isDark)
    
    console.log("Auth layout: Dark mode detection:", { 
      htmlHasDarkClass: isDark, 
      theme, 
      resolvedTheme 
    })
  }, [theme, resolvedTheme, mounted])

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

  // Get the appropriate logo URL based on current theme
  const logoUrl = isDarkTheme 
    ? businessProfile?.dark_logo_url
    : businessProfile?.light_logo_url;

  // Don't render anything until after mounting to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
