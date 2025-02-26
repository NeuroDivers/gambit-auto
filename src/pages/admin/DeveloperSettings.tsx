
import { Trash2, Sun, Globe, Shield, Database, Code, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VinScanner } from "@/components/shared/VinScanner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ProcessingSettings {
  blueEmphasis: 'normal' | 'high' | 'very-high';
  contrast: 'normal' | 'high' | 'very-high';
  morphKernelSize: '2' | '3' | '4';
  confidenceThreshold: '35' | '40' | '45';
}

export default function DeveloperSettings() {
  const [scannerLogs, setScannerLogs] = useState<Array<{
    timestamp: string;
    message: string;
    type: string;
  }>>([])

  const [settings, setSettings] = useState<ProcessingSettings>({
    blueEmphasis: 'normal',
    contrast: 'normal',
    morphKernelSize: '2',
    confidenceThreshold: '40'
  })

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('scanner-logs') || '[]')
    setScannerLogs(logs)
    
    // Store settings in localStorage
    localStorage.setItem('scanner-settings', JSON.stringify(settings))
  }, [settings])

  const handleClearCache = () => {
    localStorage.clear()
    setScannerLogs([])
    toast.success("Cache cleared successfully")
  }

  const handleVinScanned = (vin: string) => {
    toast.success(`VIN scanned: ${vin}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Settings</h1>
        <Button 
          variant="outline" 
          onClick={handleClearCache}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Cache
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" className="space-x-2">
            <Code className="h-4 w-4" />
            <span>Scanner Debug</span>
          </TabsTrigger>
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

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Processing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Blue Channel Emphasis</Label>
                    <RadioGroup
                      value={settings.blueEmphasis}
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, blueEmphasis: value as any }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="blue-normal" />
                        <Label htmlFor="blue-normal">Normal (0.5)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="blue-high" />
                        <Label htmlFor="blue-high">High (0.6)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very-high" id="blue-very-high" />
                        <Label htmlFor="blue-very-high">Very High (0.7)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Contrast Enhancement</Label>
                    <RadioGroup
                      value={settings.contrast}
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, contrast: value as any }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="contrast-normal" />
                        <Label htmlFor="contrast-normal">Normal (0.5/1.5)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="contrast-high" />
                        <Label htmlFor="contrast-high">High (0.4/1.7)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very-high" id="contrast-very-high" />
                        <Label htmlFor="contrast-very-high">Very High (0.3/1.9)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Morphological Kernel Size</Label>
                    <RadioGroup
                      value={settings.morphKernelSize}
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, morphKernelSize: value as any }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="kernel-2" />
                        <Label htmlFor="kernel-2">2px</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="kernel-3" />
                        <Label htmlFor="kernel-3">3px</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="kernel-4" />
                        <Label htmlFor="kernel-4">4px</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Confidence Threshold</Label>
                    <RadioGroup
                      value={settings.confidenceThreshold}
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, confidenceThreshold: value as any }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="35" id="confidence-35" />
                        <Label htmlFor="confidence-35">35%</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="40" id="confidence-40" />
                        <Label htmlFor="confidence-40">40%</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="45" id="confidence-45" />
                        <Label htmlFor="confidence-45">45%</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  Scanner Debug
                  <VinScanner onScan={handleVinScanned} />
                </CardTitle>
              </div>

              <div className="relative">
                <Button 
                  variant="outline" 
                  className="absolute right-0 top-0"
                  onClick={() => {
                    localStorage.removeItem('scanner-logs')
                    setScannerLogs([])
                    toast.success("Scanner logs cleared")
                  }}
                >
                  Clear Logs
                </Button>
                <ScrollArea className="h-[500px] w-full rounded-md border p-4 mt-12">
                  <div className="space-y-2">
                    {scannerLogs.map((log, index) => (
                      <div key={index} className="text-sm font-mono">
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="mx-2">-</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Theme configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                API configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Security configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Database configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
