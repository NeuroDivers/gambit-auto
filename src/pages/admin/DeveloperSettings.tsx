
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PageTitle } from "@/components/shared/PageTitle"
import { VinScanner } from "@/components/shared/VinScanner"
import { useState, useEffect } from "react"
import { ThemeColorManager } from "@/components/developer/ThemeColorManager"
import { useTheme } from "next-themes"
import { applyThemeClass, applyCustomThemeColors } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

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
      </Tabs>
      
      {/* Add the Toaster component here */}
      <Toaster />
    </div>
  )
}
