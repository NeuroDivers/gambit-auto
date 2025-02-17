
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Globe, Shield, Database, Users, Code } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

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

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api" className="space-x-2">
            <Globe className="h-4 w-4" />
            <span>API Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="space-x-2">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Anon Key (Public)</h3>
                <code className="block bg-muted p-4 rounded-md text-sm">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not configured'}
                </code>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">API URL</h3>
                <code className="block bg-muted p-4 rounded-md text-sm">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Rate Limiting</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure rate limiting for API endpoints to prevent abuse
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">CORS Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage Cross-Origin Resource Sharing settings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Connection Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Database connection and configuration settings
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Backup Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure automated database backups and retention policies
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">System Information</CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Node Version</h3>
              <p className="text-sm text-muted-foreground">{process.version}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Environment</h3>
              <p className="text-sm text-muted-foreground">{process.env.NODE_ENV}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
