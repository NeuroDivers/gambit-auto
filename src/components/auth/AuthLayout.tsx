
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string | React.ReactNode
  footerText?: string
  footerAction?: {
    text: string
    href: string
  }
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerAction,
}: AuthLayoutProps) {
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

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Dark sidebar - hidden on mobile, shown on lg screens */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img 
            src={businessProfile?.dark_logo_url || ''} 
            alt="Logo"
            className="h-8 mr-2"
          />
        </div>
      </div>
      
      {/* Main content - full width on mobile, half width on lg screens */}
      <div className="p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="relative mx-auto h-32 w-32 bg-primary/10 rounded-lg mb-6">
              {businessProfile?.light_logo_url && (
                <img 
                  src={businessProfile.light_logo_url} 
                  alt="Business Logo" 
                  className="h-full w-full object-contain p-4"
                />
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          {footerText && footerAction && (
            <p className="px-8 text-center text-sm text-muted-foreground">
              {footerText}{" "}
              <Link
                to={footerAction.href}
                className="underline underline-offset-4 hover:text-primary"
              >
                {footerAction.text}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
