import { ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import { Logo } from "@/components/shared/Logo"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { applyThemeClass } from "@/utils/themeUtils";

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [searchParams] = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const { toast } = useToast()
  const { session } = useAuth()

  useEffect(() => {
    if (session) {
      toast({
        title: "You are already logged in",
        description: (
          <>
            You are already logged in. Go to{" "}
            <Link to={callbackUrl} className="underline underline-offset-4">
              your dashboard
            </Link>
            .
          </>
        ),
      })
    }
  }, [session, toast, callbackUrl])

  useEffect(() => {
    applyThemeClass("dark");
  }, [])

  if (session) {
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="container relative flex flex-col items-center justify-center">
        <div className="absolute left-0 top-0 flex w-full justify-between p-6">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
}
