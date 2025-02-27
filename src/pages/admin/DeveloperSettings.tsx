
import { Trash2, Sun, Globe, Shield, Database, Code, Camera, Save, Undo, Check, Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { CheckSquare, Square } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProcessingSettings {
  // Basic settings
  blueEmphasis: 'zero' | 'normal' | 'high' | 'very-high';
  contrast: 'normal' | 'high' | 'very-high';
  morphKernelSize: '2' | '3' | '4' | '5';
  morphKernelType: 'rect' | 'cross' | 'ellipse';
  confidenceThreshold: '35' | '40' | '45';
  grayscaleMethod: 'luminosity' | 'average' | 'blue-channel' | 'red-channel' | 'green-channel';
  autoInvert: boolean;
  autoInvertDark: boolean;
  edgeEnhancement: boolean;
  noiseReduction: boolean;
  adaptiveContrast: boolean;
  
  // Advanced OpenCV options
  preprocessing: 'basic' | 'adaptive-threshold' | 'clahe' | 'high-pass' | 'inverted-threshold' | 'deskewing';
  denoising: 'none' | 'median' | 'gaussian' | 'bilateral' | 'non-local-means';
  edgeDetection: 'none' | 'canny' | 'sobel';
  deskewing: boolean;
  deblurring: 'none' | 'gaussian' | 'wiener';
  contrastEnhancement: 'none' | 'histogram-equalization' | 'clahe';
  angleCorrection: boolean;
  
  tesseractConfig: {
    psm: 6 | 7 | 8 | 13 | 4; // Added PSM 4 for column of text
    oem: 1 | 3;
  }
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  settings: ProcessingSettings;
  isDefault?: boolean;
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
      morphKernelType: 'rect',
      confidenceThreshold: '35',
      grayscaleMethod: 'blue-channel',
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      preprocessing: 'adaptive-threshold',
      denoising: 'median',
      edgeDetection: 'none',
      deskewing: false,
      deblurring: 'none',
      contrastEnhancement: 'none',
      angleCorrection: false,
      tesseractConfig: {
        psm: 7,
        oem: 1
      }
    }
  })

  const [presets, setPresets] = useState<Preset[]>(() => {
    const savedPresets = localStorage.getItem('scanner-presets')
    if (savedPresets) {
      try {
        return JSON.parse(savedPresets)
      } catch (error) {
        console.error('Error parsing saved scanner presets:', error)
        return []
      }
    }
    return []
  })

  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetDescription, setNewPresetDescription] = useState("")
  const [showNewPresetDialog, setShowNewPresetDialog] = useState(false)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)

  useEffect(() => {
    if (presets.length === 0) {
      const defaultPresets: Preset[] = [
        {
          id: 'default-preset',
          name: 'Default OCR Settings',
          description: 'Balanced settings for general VIN scanning',
          settings: {
            blueEmphasis: 'very-high',
            contrast: 'very-high',
            morphKernelSize: '3',
            morphKernelType: 'rect',
            confidenceThreshold: '35',
            grayscaleMethod: 'blue-channel',
            autoInvert: true,
            autoInvertDark: false,
            edgeEnhancement: true,
            noiseReduction: true,
            adaptiveContrast: true,
            preprocessing: 'adaptive-threshold',
            denoising: 'median',
            edgeDetection: 'none',
            deskewing: false,
            deblurring: 'none',
            contrastEnhancement: 'none',
            angleCorrection: false,
            tesseractConfig: {
              psm: 7,
              oem: 1
            }
          },
          isDefault: true
        },
        {
          id: 'windshield-preset',
          name: 'Windshield Scanning',
          description: 'Optimized for reading VINs through windshield glass',
          settings: {
            blueEmphasis: 'very-high',
            contrast: 'very-high',
            morphKernelSize: '3',
            morphKernelType: 'rect',
            confidenceThreshold: '35',
            grayscaleMethod: 'blue-channel',
            autoInvert: false,
            autoInvertDark: false,
            edgeEnhancement: true,
            noiseReduction: true,
            adaptiveContrast: true,
            preprocessing: 'adaptive-threshold',
            denoising: 'median',
            edgeDetection: 'canny',
            deskewing: false,
            deblurring: 'wiener',
            contrastEnhancement: 'clahe',
            angleCorrection: true,
            tesseractConfig: {
              psm: 6,
              oem: 1
            }
          }
        },
        {
          id: 'monitor-preset',
          name: 'Monitor/Screen Scanning',
          description: 'For VINs displayed on digital screens',
          settings: {
            blueEmphasis: 'normal',
            contrast: 'normal',
            morphKernelSize: '2',
            morphKernelType: 'rect',
            confidenceThreshold: '40',
            grayscaleMethod: 'green-channel',
            autoInvert: false,
            autoInvertDark: false,
            edgeEnhancement: false,
            noiseReduction: true,
            adaptiveContrast: false,
            preprocessing: 'high-pass',
            denoising: 'gaussian',
            edgeDetection: 'none',
            deskewing: false,
            deblurring: 'gaussian',
            contrastEnhancement: 'histogram-equalization',
            angleCorrection: false,
            tesseractConfig: {
              psm: 7,
              oem: 3
            }
          }
        },
        {
          id: 'low-light-preset',
          name: 'Low Light Conditions',
          description: 'Enhanced for poor lighting conditions',
          settings: {
            blueEmphasis: 'high',
            contrast: 'very-high',
            morphKernelSize: '5',
            morphKernelType: 'rect',
            confidenceThreshold: '35',
            grayscaleMethod: 'blue-channel',
            autoInvert: false,
            autoInvertDark: true,
            edgeEnhancement: true,
            noiseReduction: true,
            adaptiveContrast: true,
            preprocessing: 'clahe',
            denoising: 'non-local-means',
            edgeDetection: 'sobel',
            deskewing: false,
            deblurring: 'none',
            contrastEnhancement: 'clahe',
            angleCorrection: false,
            tesseractConfig: {
              psm: 6,
              oem: 1
            }
          }
        },
        {
          id: 'bright-light-preset',
          name: 'Bright Light/Reflections',
          description: 'For dealing with glare and reflections',
          settings: {
            blueEmphasis: 'zero',
            contrast: 'high',
            morphKernelSize: '3',
            morphKernelType: 'cross',
            confidenceThreshold: '40',
            grayscaleMethod: 'red-channel',
            autoInvert: true,
            autoInvertDark: false,
            edgeEnhancement: false,
            noiseReduction: true,
            adaptiveContrast: false,
            preprocessing: 'inverted-threshold',
            denoising: 'bilateral',
            edgeDetection: 'none',
            deskewing: false,
            deblurring: 'none',
            contrastEnhancement: 'none',
            angleCorrection: false,
            tesseractConfig: {
              psm: 6,
              oem: 1
            }
          }
        },
        {
          id: 'paper-preset',
          name: 'Paper Document Scanning',
          description: 'For printed VINs on paper documents',
          settings: {
            blueEmphasis: 'normal',
            contrast: 'high',
            morphKernelSize: '5',
            morphKernelType: 'rect',
            confidenceThreshold: '40',
            grayscaleMethod: 'green-channel',
            autoInvert: false,
            autoInvertDark: false,
            edgeEnhancement: false,
            noiseReduction: true,
            adaptiveContrast: true,
            preprocessing: 'deskewing',
            denoising: 'median',
            edgeDetection: 'none',
            deskewing: true,
            deblurring: 'none',
            contrastEnhancement: 'none',
            angleCorrection: true,
            tesseractConfig: {
              psm: 4,
              oem: 1
            }
          }
        }
      ]
      
      setPresets(defaultPresets)
      localStorage.setItem('scanner-presets', JSON.stringify(defaultPresets))
      setActivePresetId('default-preset')
    } else if (!activePresetId) {
      const defaultPreset = presets.find(p => p.isDefault) || presets[0]
      setActivePresetId(defaultPreset.id)
    }
  }, [presets, activePresetId, settings])

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
      morphKernelType: 'rect',
      confidenceThreshold: '35',
      grayscaleMethod: 'blue-channel',
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      preprocessing: 'adaptive-threshold',
      denoising: 'median',
      edgeDetection: 'none',
      deskewing: false,
      deblurring: 'none',
      contrastEnhancement: 'none',
      angleCorrection: false,
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

  const saveAsNewPreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name")
      return
    }

    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name: newPresetName,
      description: newPresetDescription || undefined,
      settings: { ...settings }
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem('scanner-presets', JSON.stringify(updatedPresets))
    setActivePresetId(newPreset.id)
    setNewPresetName("")
    setNewPresetDescription("")
    setShowNewPresetDialog(false)
    
    toast.success(`Preset "${newPresetName}" saved`)
  }

  const updateCurrentPreset = () => {
    if (!activePresetId) return

    const updatedPresets = presets.map(preset => 
      preset.id === activePresetId 
        ? { ...preset, settings: { ...settings } } 
        : preset
    )
    
    setPresets(updatedPresets)
    localStorage.setItem('scanner-presets', JSON.stringify(updatedPresets))
    toast.success("Current preset updated with latest settings")
  }

  const loadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    setSettings({ ...preset.settings })
    setActivePresetId(preset.id)
    toast.info(`Loaded preset: ${preset.name}`)
  }

  const deletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset || preset.isDefault) return

    const updatedPresets = presets.filter(p => p.id !== presetId)
    setPresets(updatedPresets)
    localStorage.setItem('scanner-presets', JSON.stringify(updatedPresets))
    
    if (activePresetId === presetId) {
      const defaultPreset = updatedPresets.find(p => p.isDefault) || updatedPresets[0]
      if (defaultPreset) {
        setActivePresetId(defaultPreset.id)
        setSettings({ ...defaultPreset.settings })
      }
    }
    
    toast.success(`Deleted preset: ${preset.name}`)
  }

  const getActivePresetName = () => {
    const preset = presets.find(p => p.id === activePresetId)
    return preset ? preset.name : "Unknown"
  }

  const getActivePresetDescription = () => {
    const preset = presets.find(p => p.id === activePresetId)
    return preset?.description || ""
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Developer Settings</h1>
        <Button 
          variant="outline" 
          onClick={handleClearCache}
          className="gap-2 w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
          Clear Cache
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="logs" className="space-x-2 flex-grow">
            <Code className="h-4 w-4" />
            <span>Scanner Debug</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="space-x-2 flex-grow">
            <Sun className="h-4 w-4" />
            <span>Theme</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="space-x-2 flex-grow">
            <Globe className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="space-x-2 flex-grow">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="space-x-2 flex-grow">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Processing Settings
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  title="Update current preset"
                  onClick={updateCurrentPreset}
                >
                  <Save className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  title="Save as new preset"
                  onClick={() => setShowNewPresetDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                {activePresetId && !presets.find(p => p.id === activePresetId)?.isDefault && (
                  <Button
                    variant="outline"
                    size="icon"
                    title="Delete current preset"
                    onClick={() => deletePreset(activePresetId)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Preset Selection</Label>
                <ScrollArea className="h-52 border rounded-md p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {presets.map((preset) => (
                      <Card 
                        key={preset.id} 
                        className={`cursor-pointer transition-all hover:bg-accent ${activePresetId === preset.id ? 'border-primary bg-primary/10' : ''}`}
                        onClick={() => loadPreset(preset.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="pt-0.5">
                              {activePresetId === preset.id ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{preset.name}</div>
                              {preset.description && (
                                <div className="text-xs text-muted-foreground mb-1">{preset.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {preset.isDefault && "(Default) "}
                                PSM: {preset.settings.tesseractConfig.psm}, 
                                OEM: {preset.settings.tesseractConfig.oem}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-xs">
                  <p className="text-muted-foreground">
                    Current: {getActivePresetName()}
                  </p>
                  {getActivePresetDescription() && (
                    <p className="text-muted-foreground mt-1">
                      {getActivePresetDescription()}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-4 border-b pb-4">
                    <Label className="text-base font-medium">Image Processing Features</Label>
                    <div className="space-y-4">
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
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="deskewing" className="flex-1">
                          Deskewing
                          <p className="text-sm text-muted-foreground">
                            Automatically correct skewed text
                          </p>
                        </Label>
                        <Switch
                          id="deskewing"
                          checked={settings.deskewing}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, deskewing: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="angle-correction" className="flex-1">
                          Angle Correction
                          <p className="text-sm text-muted-foreground">
                            Use Hough transform to correct rotation
                          </p>
                        </Label>
                        <Switch
                          id="angle-correction"
                          checked={settings.angleCorrection}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, angleCorrection: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Grayscale Method</Label>
                    <RadioGroup
                      value={settings.grayscaleMethod}
                      onValueChange={(value: 'luminosity' | 'average' | 'blue-channel' | 'red-channel' | 'green-channel') => 
                        setSettings(prev => ({ ...prev, grayscaleMethod: value }))
                      }
                      className="mt-2 space-y-2"
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
                        <Label htmlFor="gray-blue">Blue Channel Only (VIN Plates)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="green-channel" id="gray-green" />
                        <Label htmlFor="gray-green">Green Channel (Screens/Print)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="red-channel" id="gray-red" />
                        <Label htmlFor="gray-red">Red Channel (Glare Reduction)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Blue Channel Emphasis</Label>
                    <RadioGroup
                      value={settings.blueEmphasis}
                      onValueChange={(value: 'zero' | 'normal' | 'high' | 'very-high') => 
                        setSettings(prev => ({ ...prev, blueEmphasis: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="zero" id="blue-zero" />
                        <Label htmlFor="blue-zero">Zero (0.33)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="blue-normal" />
                        <Label htmlFor="blue-normal">Normal (0.5)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="blue-high" />
                        <Label htmlFor="blue-high">High (0.7)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very-high" id="blue-very-high" />
                        <Label htmlFor="blue-very-high">Very High (0.8)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Tesseract Page Segmentation Mode</Label>
                    <RadioGroup
                      value={settings.tesseractConfig.psm.toString()}
                      onValueChange={(value) => 
                        setSettings(prev => ({
                          ...prev,
                          tesseractConfig: {
                            ...prev.tesseractConfig,
                            psm: parseInt(value) as 6 | 7 | 8 | 13 | 4
                          }
                        }))
                      }
                      className="mt-2 space-y-2"
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
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="psm-4" />
                        <Label htmlFor="psm-4">Column of Text (PSM 4)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">OCR Engine Mode</Label>
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
                      className="mt-2 space-y-2"
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

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Morphological Kernel Size</Label>
                    <RadioGroup
                      value={settings.morphKernelSize}
                      onValueChange={(value: '2' | '3' | '4' | '5') => 
                        setSettings(prev => ({ ...prev, morphKernelSize: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="kernel-2" />
                        <Label htmlFor="kernel-2">2px (Minimal)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="kernel-3" />
                        <Label htmlFor="kernel-3">3px (Standard)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="kernel-4" />
                        <Label htmlFor="kernel-4">4px (Medium)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="kernel-5" />
                        <Label htmlFor="kernel-5">5px (Aggressive)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Kernel Type</Label>
                    <RadioGroup
                      value={settings.morphKernelType}
                      onValueChange={(value: 'rect' | 'cross' | 'ellipse') => 
                        setSettings(prev => ({ ...prev, morphKernelType: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rect" id="kernel-rect" />
                        <Label htmlFor="kernel-rect">Rectangular (General)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cross" id="kernel-cross" />
                        <Label htmlFor="kernel-cross">Cross (Reflection Removal)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ellipse" id="kernel-ellipse" />
                        <Label htmlFor="kernel-ellipse">Elliptical (Smoother)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Preprocessing Method</Label>
                    <RadioGroup
                      value={settings.preprocessing}
                      onValueChange={(value: 'basic' | 'adaptive-threshold' | 'clahe' | 'high-pass' | 'inverted-threshold' | 'deskewing') => 
                        setSettings(prev => ({ ...prev, preprocessing: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="preprocess-basic" />
                        <Label htmlFor="preprocess-basic">Basic (Simple Threshold)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adaptive-threshold" id="preprocess-adaptive" />
                        <Label htmlFor="preprocess-adaptive">Adaptive Threshold</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clahe" id="preprocess-clahe" />
                        <Label htmlFor="preprocess-clahe">CLAHE (Best for Low Light)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high-pass" id="preprocess-highpass" />
                        <Label htmlFor="preprocess-highpass">High-Pass Filter (Screens)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inverted-threshold" id="preprocess-inverted" />
                        <Label htmlFor="preprocess-inverted">Inverted Threshold (Bright)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deskewing" id="preprocess-deskew" />
                        <Label htmlFor="preprocess-deskew">Deskewing (Angled Text)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Denoising Method</Label>
                    <RadioGroup
                      value={settings.denoising}
                      onValueChange={(value: 'none' | 'median' | 'gaussian' | 'bilateral' | 'non-local-means') => 
                        setSettings(prev => ({ ...prev, denoising: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="denoise-none" />
                        <Label htmlFor="denoise-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="median" id="denoise-median" />
                        <Label htmlFor="denoise-median">Median Filter (Standard)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gaussian" id="denoise-gaussian" />
                        <Label htmlFor="denoise-gaussian">Gaussian (Screen Content)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bilateral" id="denoise-bilateral" />
                        <Label htmlFor="denoise-bilateral">Bilateral (Preserves Edges)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non-local-means" id="denoise-nlm" />
                        <Label htmlFor="denoise-nlm">Non-Local Means (Best Quality)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Edge Detection</Label>
                    <RadioGroup
                      value={settings.edgeDetection}
                      onValueChange={(value: 'none' | 'canny' | 'sobel') => 
                        setSettings(prev => ({ ...prev, edgeDetection: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="edge-none" />
                        <Label htmlFor="edge-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="canny" id="edge-canny" />
                        <Label htmlFor="edge-canny">Canny (Precise)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sobel" id="edge-sobel" />
                        <Label htmlFor="edge-sobel">Sobel (Stronger)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Deblurring Method</Label>
                    <RadioGroup
                      value={settings.deblurring}
                      onValueChange={(value: 'none' | 'gaussian' | 'wiener') => 
                        setSettings(prev => ({ ...prev, deblurring: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="deblur-none" />
                        <Label htmlFor="deblur-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gaussian" id="deblur-gaussian" />
                        <Label htmlFor="deblur-gaussian">Gaussian Blur</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wiener" id="deblur-wiener" />
                        <Label htmlFor="deblur-wiener">Wiener Filter (Advanced)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Contrast Enhancement</Label>
                    <RadioGroup
                      value={settings.contrastEnhancement}
                      onValueChange={(value: 'none' | 'histogram-equalization' | 'clahe') => 
                        setSettings(prev => ({ ...prev, contrastEnhancement: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="contrast-none" />
                        <Label htmlFor="contrast-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="histogram-equalization" id="contrast-equalization" />
                        <Label htmlFor="contrast-equalization">Histogram Equalization</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clahe" id="contrast-clahe" />
                        <Label htmlFor="contrast-clahe">CLAHE (Adaptive)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Confidence Threshold</Label>
                    <RadioGroup
                      value={settings.confidenceThreshold}
                      onValueChange={(value: '35' | '40' | '45') => 
                        setSettings(prev => ({ ...prev, confidenceThreshold: value }))
                      }
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="35" id="confidence-35" />
                        <Label htmlFor="confidence-35">35% (More Results)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="40" id="confidence-40" />
                        <Label htmlFor="confidence-40">40% (Balanced)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="45" id="confidence-45" />
                        <Label htmlFor="confidence-45">45% (More Accurate)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {scannerLogs.map((log, index) => (
                        <div key={index} className="text-sm font-mono break-words">
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

      <Dialog open={showNewPresetDialog} onOpenChange={setShowNewPresetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Current Settings as Preset</DialogTitle>
            <DialogDescription>
              Enter a name for your preset to save the current OCR scanner settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preset-name" className="text-right">
                Preset Name
              </Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 'High Contrast VIN Setting'"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preset-description" className="text-right">
                Description
              </Label>
              <Input
                id="preset-description"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description of this preset"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPresetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAsNewPreset}>Save Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
