
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PageTitle } from "@/components/shared/PageTitle"
import { VinScanner } from "@/components/shared/VinScanner"
import { useState, useEffect } from "react"
import { ThemeColorManager } from "@/components/developer/ThemeColorManager"
import { useTheme } from "next-themes"
import { applyThemeClass, applyCustomThemeColors } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function DeveloperSettings() {
  const [scannedVin, setScannedVin] = useState<string>("")
  const { theme, resolvedTheme } = useTheme()
  
  // Ensure theme is applied on component mount
  useEffect(() => {
    // Apply theme class based on current theme or system preference
    applyThemeClass(theme, resolvedTheme)
    
    // Check for and apply any custom theme colors from localStorage
    applyCustomThemeColors()
  }, [theme, resolvedTheme])

  const clearLocalStorage = () => {
    localStorage.clear()
    toast.success("Local storage cleared successfully. You may need to reload the page.")
  }

  const clearSessionStorage = () => {
    sessionStorage.clear()
    toast.success("Session storage cleared successfully. You may need to reload the page.")
  }

  const clearCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await window.caches.keys()
        await Promise.all(cacheNames.map(name => window.caches.delete(name)))
        toast.success("Browser caches cleared successfully")
      } catch (error) {
        console.error("Error clearing caches:", error)
        toast.error("Failed to clear browser caches")
      }
    } else {
      toast.error("Cache API not supported in this browser")
    }
  }

  const reloadApplication = () => {
    window.location.reload()
  }

  return (
    <div className="container py-8 space-y-6">
      <PageTitle 
        title="Developer Settings" 
        description="Advanced settings and tools for developers"
      />

      <Tabs defaultValue="theme-editor" className="w-full">
        <TabsList>
          <TabsTrigger value="theme-editor">Theme Editor</TabsTrigger>
          <TabsTrigger value="vin-scanner">VIN Scanner</TabsTrigger>
          <TabsTrigger value="cache-management">Cache Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme-editor">
          <ThemeColorManager />
        </TabsContent>
        
        <TabsContent value="vin-scanner">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">VIN Barcode Scanner</h3>
            <p className="text-muted-foreground mb-6">
              Test the VIN barcode scanner functionality. This uses the device camera to scan 
              VIN barcodes found on vehicle windows and documentation.
            </p>
            
            <div className="flex items-center gap-4">
              <VinScanner onScan={setScannedVin} />
              <div>
                <span className="text-sm text-muted-foreground">Scanned VIN:</span>
                <div className="font-mono bg-muted p-2 rounded mt-1">
                  {scannedVin || "No VIN scanned yet"}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cache-management">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Cache Management</h3>
            <p className="text-muted-foreground mb-6">
              Use these tools to clear various types of cached data. You may need to reload the application after clearing caches.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Local Storage</h4>
                  <p className="text-sm text-muted-foreground">Clear persisted application data</p>
                </div>
                <Button variant="outline" onClick={clearLocalStorage}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Local Storage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Session Storage</h4>
                  <p className="text-sm text-muted-foreground">Clear temporary session data</p>
                </div>
                <Button variant="outline" onClick={clearSessionStorage}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Session Storage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Browser Caches</h4>
                  <p className="text-sm text-muted-foreground">Clear browser's cached resources</p>
                </div>
                <Button variant="outline" onClick={clearCaches}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Caches
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Reload Application</h4>
                  <p className="text-sm text-muted-foreground">Refresh the application with cleared caches</p>
                </div>
                <Button variant="default" onClick={reloadApplication}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  )
}
