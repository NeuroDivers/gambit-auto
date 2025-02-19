import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Globe, Shield, Database, Code, Sun, Moon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

export default function DeveloperSettings() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { theme } = useTheme()

  const [colors, setColors] = useState({
    light: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#7c3aed',
      secondary: '#f3f4f6',
      accent: '#8b5cf6',
      buttonPrimary: '#7c3aed',
      buttonPrimaryHover: '#6d28d9',
      buttonSecondary: '#f3f4f6',
      buttonSecondaryHover: '#e5e7eb'
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#8b5cf6',
      secondary: '#1f2937',
      accent: '#7c3aed',
      buttonPrimary: '#8b5cf6',
      buttonPrimaryHover: '#7c3aed',
      buttonSecondary: '#1f2937',
      buttonSecondaryHover: '#374151'
    }
  })

  useEffect(() => {
    setHasAccess(true)
  }, [])

  const handleColorChange = (mode: 'light' | 'dark', colorKey: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [colorKey]: value
      }
    }))
  }

  const handleSaveColors = async () => {
    try {
      const { error } = await supabase
        .from('site_colors')
        .upsert([
          {
            theme_mode: 'light',
            background: colors.light.background,
            foreground: colors.light.foreground,
            primary_color: colors.light.primary,
            accent_color: colors.light.accent,
            button_primary: colors.light.buttonPrimary,
            button_primary_hover: colors.light.buttonPrimaryHover,
            button_secondary: colors.light.buttonSecondary,
            button_secondary_hover: colors.light.buttonSecondaryHover
          },
          {
            theme_mode: 'dark',
            background: colors.dark.background,
            foreground: colors.dark.foreground,
            primary_color: colors.dark.primary,
            accent_color: colors.dark.accent,
            button_primary: colors.dark.buttonPrimary,
            button_primary_hover: colors.dark.buttonPrimaryHover,
            button_secondary: colors.dark.buttonSecondary,
            button_secondary_hover: colors.dark.buttonSecondaryHover
          }
        ])

      if (error) throw error
      toast.success('Theme colors saved successfully')
    } catch (error) {
      console.error('Error saving colors:', error)
      toast.error('Failed to save theme colors')
    }
  }

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

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList>
          <TabsTrigger value="theme" className="space-x-2">
            <Sun className="h-4 w-4" />
            <span>Theme Configuration</span>
          </TabsTrigger>
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

        <TabsContent value="theme" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Light Theme Colors
                </CardTitle>
                <Sun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="light-background">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="light-background"
                      type="color"
                      value={colors.light.background}
                      onChange={(e) => handleColorChange('light', 'background', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.light.background}
                      onChange={(e) => handleColorChange('light', 'background', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="light-foreground">Foreground</Label>
                  <div className="flex gap-2">
                    <Input
                      id="light-foreground"
                      type="color"
                      value={colors.light.foreground}
                      onChange={(e) => handleColorChange('light', 'foreground', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.light.foreground}
                      onChange={(e) => handleColorChange('light', 'foreground', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="light-primary">Primary</Label>
                  <div className="flex gap-2">
                    <Input
                      id="light-primary"
                      type="color"
                      value={colors.light.primary}
                      onChange={(e) => handleColorChange('light', 'primary', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.light.primary}
                      onChange={(e) => handleColorChange('light', 'primary', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="light-accent">Accent</Label>
                  <div className="flex gap-2">
                    <Input
                      id="light-accent"
                      type="color"
                      value={colors.light.accent}
                      onChange={(e) => handleColorChange('light', 'accent', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.light.accent}
                      onChange={(e) => handleColorChange('light', 'accent', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Dark Theme Colors
                </CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dark-background">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dark-background"
                      type="color"
                      value={colors.dark.background}
                      onChange={(e) => handleColorChange('dark', 'background', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.dark.background}
                      onChange={(e) => handleColorChange('dark', 'background', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dark-foreground">Foreground</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dark-foreground"
                      type="color"
                      value={colors.dark.foreground}
                      onChange={(e) => handleColorChange('dark', 'foreground', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.dark.foreground}
                      onChange={(e) => handleColorChange('dark', 'foreground', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dark-primary">Primary</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dark-primary"
                      type="color"
                      value={colors.dark.primary}
                      onChange={(e) => handleColorChange('dark', 'primary', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.dark.primary}
                      onChange={(e) => handleColorChange('dark', 'primary', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dark-accent">Accent</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dark-accent"
                      type="color"
                      value={colors.dark.accent}
                      onChange={(e) => handleColorChange('dark', 'accent', e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={colors.dark.accent}
                      onChange={(e) => handleColorChange('dark', 'accent', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveColors}>
              Save Theme Colors
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Anon Key (Public)</h3>
                <code className="block bg-muted p-4 rounded-md text-sm">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY || 'Not configured'}
                </code>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">API URL</h3>
                <code className="block bg-muted p-4 rounded-md text-sm">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
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
              <h3 className="font-semibold">Environment</h3>
              <p className="text-sm text-muted-foreground">
                {import.meta.env.MODE}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">App Version</h3>
              <p className="text-sm text-muted-foreground">
                {import.meta.env.VITE_APP_VERSION || '1.0.0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
