
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
  grayscaleMethod: 'luminosity' | 'average' | 'blue-channel';
  autoInvert: boolean;
  autoInvertDark: boolean;
  edgeEnhancement: boolean;
  noiseReduction: boolean;
  adaptiveContrast: boolean;
  intelligentCrop: boolean;
  dynamicThreshold: boolean;
  regionPadding: 'small' | 'medium' | 'large';
  tesseractConfig: {
    psm: 6 | 7 | 8 | 13;
    oem: 1 | 3;
  }
}

export default function DeveloperSettings() {
  const [scannerLogs, setScannerLogs] = useState<Array<{
    timestamp: string;
    message: string;
    type: string;
  }>>([])

  const [settings, setSettings] = useState<ProcessingSettings>(() => {
    const savedSettings = localStorage.getItem('scanner-settings')
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch (error) {
        console.error('Error parsing saved scanner settings:', error)
      }
    }
    
    return {
      blueEmphasis: 'very-high',
      contrast: 'very-high',
      morphKernelSize: '3',
      confidenceThreshold: '35',
      grayscaleMethod: 'blue-channel',
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      intelligentCrop: false,
      dynamicThreshold: false,
      regionPadding: 'medium',
      tesseractConfig: {
        psm: 7,
        oem: 1
      }
    }
  })

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('scanner-logs') || '[]')
    setScannerLogs(logs)
    
    localStorage.setItem('scanner-settings', JSON.stringify(settings))
  }, [settings])

  const handleClearCache = () => {
    localStorage.clear()
    setScannerLogs([])
    
    setSettings({
      blueEmphasis: 'very-high',
      contrast: 'very-high',
      morphKernelSize: '3',
      confidenceThreshold: '35',
      grayscaleMethod: 'blue-channel',
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      intelligentCrop: false,
      dynamicThreshold: false,
      regionPadding: 'medium',
      tesseractConfig: {
        psm: 7,
        oem: 1
      }
    })
    
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
                  <div className="space-y-4 border-b pb-4">
                    <Label>Image Processing Features</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-invert" className="flex-1">
                          Auto Invert Light Text
                          <p className="text-sm text-muted-foreground">
                            Automatically invert light text on dark background
                          </p>
                        </Label>
                        <Switch
                          id="auto-invert"
                          checked={settings.autoInvert}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, autoInvert: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-invert-dark" className="flex-1">
                          Auto Invert Dark Text
                          <p className="text-sm text-muted-foreground">
                            Automatically invert dark text on light background
                          </p>
                        </Label>
                        <Switch
                          id="auto-invert-dark"
                          checked={settings.autoInvertDark}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, autoInvertDark: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="intelligent-crop" className="flex-1">
                          Intelligent Text Region Detection
                          <p className="text-sm text-muted-foreground">
                            Automatically detect and crop to text region
                          </p>
                        </Label>
                        <Switch
                          id="intelligent-crop"
                          checked={settings.intelligentCrop}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, intelligentCrop: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="dynamic-threshold" className="flex-1">
                          Dynamic Thresholding
                          <p className="text-sm text-muted-foreground">
                            Use Otsu's method for optimal threshold detection
                          </p>
                        </Label>
                        <Switch
                          id="dynamic-threshold"
                          checked={settings.dynamicThreshold}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, dynamicThreshold: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="edge-enhancement" className="flex-1">
                          Edge Enhancement
                          <p className="text-sm text-muted-foreground">
                            Apply unsharp masking for better edge definition
                          </p>
                        </Label>
                        <Switch
                          id="edge-enhancement"
                          checked={settings.edgeEnhancement}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, edgeEnhancement: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="noise-reduction" className="flex-1">
                          Noise Reduction
                          <p className="text-sm text-muted-foreground">
                            Apply median filter to remove noise
                          </p>
                        </Label>
                        <Switch
                          id="noise-reduction"
                          checked={settings.noiseReduction}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, noiseReduction: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="adaptive-contrast" className="flex-1">
                          Adaptive Contrast
                          <p className="text-sm text-muted-foreground">
                            Dynamically adjust contrast based on local area
                          </p>
                        </Label>
                        <Switch
                          id="adaptive-contrast"
                          checked={settings.adaptiveContrast}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, adaptiveContrast: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Region Padding</Label>
                    <RadioGroup
                      value={settings.regionPadding}
                      onValueChange={(value: 'small' | 'medium' | 'large') => 
                        setSettings(prev => ({ ...prev, regionPadding: value }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="padding-small" />
                        <Label htmlFor="padding-small">Small (2%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="padding-medium" />
                        <Label htmlFor="padding-medium">Medium (5%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="padding-large" />
                        <Label htmlFor="padding-large">Large (10%)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Grayscale Method</Label>
                    <RadioGroup
                      value={settings.grayscaleMethod}
                      onValueChange={(value: 'luminosity' | 'average' | 'blue-channel') => 
                        setSettings(prev => ({ ...prev, grayscaleMethod: value }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="luminosity" id="gray-luminosity" />
                        <Label htmlFor="gray-luminosity">Luminosity (Default)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="average" id="gray-average" />
                        <Label htmlFor="gray-average">Average</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="blue-channel" id="gray-blue" />
                        <Label htmlFor="gray-blue">Blue Channel Only</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Blue Channel Emphasis</Label>
                    <RadioGroup
                      value={settings.blueEmphasis}
                      onValueChange={(value: 'normal' | 'high' | 'very-high') => 
                        setSettings(prev => ({ ...prev, blueEmphasis: value }))
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
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Contrast Enhancement</Label>
                    <RadioGroup
                      value={settings.contrast}
                      onValueChange={(value: 'normal' | 'high' | 'very-high') => 
                        setSettings(prev => ({ ...prev, contrast: value }))
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

                  <div>
                    <Label>Tesseract Page Segmentation Mode</Label>
                    <RadioGroup
                      value={settings.tesseractConfig.psm.toString()}
                      onValueChange={(value) => 
                        setSettings(prev => ({
                          ...prev,
                          tesseractConfig: {
                            ...prev.tesseractConfig,
                            psm: parseInt(value) as 6 | 7 | 8 | 13
                          }
                        }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="7" id="psm-7" />
                        <Label htmlFor="psm-7">Single Line (PSM 7)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6" id="psm-6" />
                        <Label htmlFor="psm-6">Uniform Block (PSM 6)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="8" id="psm-8" />
                        <Label htmlFor="psm-8">Single Word (PSM 8)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="13" id="psm-13" />
                        <Label htmlFor="psm-13">Raw Line (PSM 13)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>OCR Engine Mode</Label>
                    <RadioGroup
                      value={settings.tesseractConfig.oem.toString()}
                      onValueChange={(value) => 
                        setSettings(prev => ({
                          ...prev,
                          tesseractConfig: {
                            ...prev.tesseractConfig,
                            oem: parseInt(value) as 1 | 3
                          }
                        }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="oem-1" />
                        <Label htmlFor="oem-1">Neural Nets Only (OEM 1)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="oem-3" />
                        <Label htmlFor="oem-3">Default (OEM 3)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Morphological Kernel Size</Label>
                    <RadioGroup
                      value={settings.morphKernelSize}
                      onValueChange={(value: '2' | '3' | '4') => 
                        setSettings(prev => ({ ...prev, morphKernelSize: value }))
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
                      onValueChange={(value: '35' | '40' | '45') => 
                        setSettings(prev => ({ ...prev, confidenceThreshold: value }))
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

              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-medium">
                    Scanner Debug
                  </CardTitle>
                  <VinScanner onScan={handleVinScanned} />
                </div>
                
                <div className="relative">
                  <div className="flex justify-end mb-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        localStorage.removeItem('scanner-logs')
                        setScannerLogs([])
                        toast.success("Scanner logs cleared")
                      }}
                    >
                      Clear Logs
                    </Button>
                  </div>
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
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
