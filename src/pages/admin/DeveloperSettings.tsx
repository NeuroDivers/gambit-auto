
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PageTitle } from "@/components/shared/PageTitle"
import { VinScanner } from "@/components/shared/VinScanner"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { ThemeColorManager } from "@/components/developer/ThemeColorManager"

export default function DeveloperSettings() {
  const [scannedVin, setScannedVin] = useState<string>("")
  const { theme } = useTheme()

  // Color variables from our theme
  const themeVariables = [
    { name: "background", description: "Main background color" },
    { name: "foreground", description: "Main text color" },
    { name: "card", description: "Card background color" },
    { name: "card-foreground", description: "Card text color" },
    { name: "popover", description: "Popover background color" },
    { name: "popover-foreground", description: "Popover text color" },
    { name: "primary", description: "Primary action color" },
    { name: "primary-foreground", description: "Text on primary color" },
    { name: "secondary", description: "Secondary/subtle color" },
    { name: "secondary-foreground", description: "Text on secondary color" },
    { name: "muted", description: "Muted background color" },
    { name: "muted-foreground", description: "Muted text color" },
    { name: "accent", description: "Accent color for highlights" },
    { name: "accent-foreground", description: "Text on accent color" },
    { name: "destructive", description: "Destructive action color" },
    { name: "destructive-foreground", description: "Text on destructive color" },
    { name: "border", description: "Border color" },
    { name: "input", description: "Input border color" },
    { name: "ring", description: "Focus ring color" },
  ]

  const handleCopyCSS = () => {
    const root = document.documentElement
    const styles = getComputedStyle(root)
    
    let cssText = `:root {\n`
    themeVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${styles.getPropertyValue(`--${variable.name}`)}\n`
    })
    cssText += `}`
    
    navigator.clipboard.writeText(cssText)
    toast.success("Theme CSS copied to clipboard")
  }

  return (
    <div className="container py-8 space-y-6">
      <PageTitle 
        title="Developer Settings" 
        description="Advanced settings and tools for developers"
      />

      <Tabs defaultValue="themes" className="w-full">
        <TabsList>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="theme-editor">Theme Editor</TabsTrigger>
          <TabsTrigger value="vin-scanner">VIN Scanner</TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes">
          <Card className="p-6">
            <div className="mb-4 space-y-2">
              <h3 className="text-lg font-medium">Theme Colors</h3>
              <p className="text-muted-foreground">
                Current theme: <span className="font-medium">{theme || "system"}</span>
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleCopyCSS}
              >
                <Copy className="h-4 w-4" />
                Copy theme CSS variables
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themeVariables.map((variable) => (
                <div key={variable.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{variable.name}</h4>
                    <div 
                      className="h-4 w-4 rounded-full border"
                      style={{ background: `hsl(var(--${variable.name}))` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{variable.description}</div>
                  <div 
                    className="h-10 rounded-md border flex items-center justify-center text-xs"
                    style={{ 
                      background: variable.name.includes("foreground") ? 
                        `hsl(var(--${variable.name.replace("-foreground", "")}))`
                        : "transparent",
                      color: variable.name.includes("foreground") ? 
                        `hsl(var(--${variable.name}))` 
                        : `hsl(var(--${variable.name}))`
                    }}
                  >
                    {variable.name.includes("foreground") ? 
                      "Text on this color" : "This color"}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Color Palette Examples</h3>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Primary Colors</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-primary"></div>
                    <span className="text-xs mt-1">Primary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-primary/80"></div>
                    <span className="text-xs mt-1">Primary/80%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-primary/60"></div>
                    <span className="text-xs mt-1">Primary/60%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-primary/40"></div>
                    <span className="text-xs mt-1">Primary/40%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-primary/20"></div>
                    <span className="text-xs mt-1">Primary/20%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">UI Colors</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-background border"></div>
                    <span className="text-xs mt-1">Background</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-card border"></div>
                    <span className="text-xs mt-1">Card</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-muted"></div>
                    <span className="text-xs mt-1">Muted</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-secondary"></div>
                    <span className="text-xs mt-1">Secondary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-20 rounded-md bg-destructive"></div>
                    <span className="text-xs mt-1">Destructive</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
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
    </div>
  )
}
