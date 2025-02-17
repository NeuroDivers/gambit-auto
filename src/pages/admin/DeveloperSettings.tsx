
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DeveloperSettings() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission("developer_settings", "page_access")
      console.log("Developer settings permission check:", hasPermission)
      setHasAccess(hasPermission)
    }
    checkAccess()
  }, [checkPermission])

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access developer settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Developer settings and API configuration options will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
