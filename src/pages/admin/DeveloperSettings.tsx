
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeColorManager } from "@/components/developer/ThemeColorManager"
import { useEffect } from "react"
import { applyThemeClass } from "@/utils/themeUtils"

export default function DeveloperSettings() {
  // Apply theme on component mount
  useEffect(() => {
    // Get saved theme or use default
    const savedTheme = localStorage.getItem('theme') || 'dark'
    applyThemeClass(savedTheme)
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="theme">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
          <TabsTrigger value="theme">Theme Settings</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeColorManager />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Manage your API keys and webhook configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>API settings will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
