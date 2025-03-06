
import { useRouteError, useNavigate, isRouteErrorResponse, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Home, ArrowLeft, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export function ErrorBoundary({ children }: { children?: React.ReactNode }) {
  const error = useRouteError()
  const navigate = useNavigate()
  const [errorDetails, setErrorDetails] = useState<{
    title: string,
    message: string
  }>({
    title: "An error occurred",
    message: "Something went wrong. Please try again."
  })
  
  useEffect(() => {
    if (error) {
      console.error("Application error:", error)
      
      if (error === null || error === undefined) {
        // Handle null errors specifically
        setErrorDetails({
          title: "Application Error",
          message: "The application encountered an unexpected null error. Please try refreshing the page."
        })
      } else if (isRouteErrorResponse(error)) {
        // Handle route errors (404, etc)
        setErrorDetails({
          title: `${error.status} - ${error.statusText}`,
          message: error.data?.message || "The requested page could not be found."
        })
      } else if (error instanceof Error) {
        // Handle JavaScript errors
        setErrorDetails({
          title: error.name || "Error",
          message: error.message || "An unexpected error occurred."
        })
        
        // Log more details to console for debugging
        if (error.stack) {
          console.error("Error stack:", error.stack)
        }
      } else if (typeof error === 'string') {
        setErrorDetails({
          title: "Error",
          message: error
        })
      } else {
        // Handle unknown error types
        setErrorDetails({
          title: "Unknown Error",
          message: "An unexpected error occurred. Please try refreshing the page."
        })
      }
    }
  }, [error])
  
  // If there's no error, render the children
  if (!error && children) {
    return <>{children}</>
  } else if (!error) {
    return <Outlet />
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mt-2">
            {errorDetails.title}
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm opacity-90">
            {errorDetails.message}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
