
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Clipboard, RotateCcw, Check, AlignLeft, Barcode, Info, Play, Pause, Settings, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createWorker, PSM, Worker } from 'tesseract.js'
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library'
import { validateVIN, postProcessVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { useIsMobile } from "@/hooks/use-mobile"
import { preprocessImage } from "@/utils/image-processing"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { PageTitle } from "@/components/shared/PageTitle"
import { Toggle } from "@/components/ui/toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { CheckSquare, Square } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VinData {
  vin: string | null
  confidence: number
  valid: boolean
  nhtsaLookup: any | null
  nhtsaValid: boolean
}

interface OcrPreset {
  name: string
  config: {
    tessedit_pageseg_mode: PSM
    tessedit_char_whitelist?: string
  }
}

const ocrPresets: OcrPreset[] = [
  {
    name: "Aggressive",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    }
  },
  {
    name: "Balanced",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE
    }
  },
  {
    name: "Fast",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_WORD
    }
  }
]

export default function ScanVin() {
  console.log("ScanVin component rendered");
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const returnPath = state?.returnPath || "/estimates/create"
  
  const [vinData, setVinData] = useState<VinData>({
    vin: null,
    confidence: 0,
    valid: false,
    nhtsaLookup: null,
    nhtsaValid: false
  })
  const [isConfirmationView, setIsConfirmationView] = useState(false)
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [isNHTSALookupLoading, setIsNHTSALookupLoading] = useState(false)
  const [manualVin, setManualVin] = useState("")
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isOcrSettingsOpen, setIsOcrSettingsOpen] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<OcrPreset>(ocrPresets[0])
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('scanner-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    
    return {
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      grayscaleMethod: 'blue-channel',
      blueEmphasis: 'very-high',
      contrast: 'very-high',
      morphKernelSize: '3',
    };
  });
  
  const [morphKernelSize, setMorphKernelSize] = useState<string>(() => {
    const savedSettings = JSON.parse(localStorage.getItem('scanner-settings') || '{}')
    return savedSettings.morphKernelSize || '3'
  })
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const isMobile = useIsMobile()
  
  useEffect(() => {
    console.log("Settings changed:", settings);
    localStorage.setItem('scanner-settings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    const initialize = async () => {
      if (scanMode === 'text') {
        await setupTesseract()
      } else if (scanMode === 'barcode') {
        await setupBarcodeScanner()
      }
    }

    initialize()

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
      if (barcodeReaderRef.current) {
        barcodeReaderRef.current.reset()
      }
    }
  }, [scanMode])

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      startCamera()
    }
  }, [isCameraActive])

  const setupTesseract = async () => {
    try {
      log('Initializing Tesseract...');
      // Create the worker with options for Tesseract.js v4
      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            // Optionally log progress
            console.log(`OCR progress: ${Math.round(progress.progress * 100)}%`);
          }
        }
      });
      
      // Initialize with language
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Apply the preset configuration
      await worker.setParameters(currentPreset.config);
      
      // Store worker reference
      workerRef.current = worker;
      
      log('Tesseract OCR engine is ready.');
    } catch (error: any) {
      console.error('Error setting up Tesseract:', error);
      toast.error(`Failed to setup OCR engine: ${error.message}`);
    }
  };

  const setupBarcodeScanner = async () => {
    try {
      const hints = new Map<DecodeHintType, any>();
      const formats = [
        BarcodeFormat.CODE_128, 
        BarcodeFormat.CODE_39, 
        BarcodeFormat.EAN_13, 
        BarcodeFormat.EAN_8, 
        BarcodeFormat.UPC_A, 
        BarcodeFormat.UPC_E, 
        BarcodeFormat.ITF
      ];
      
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      
      const reader = new BrowserMultiFormatReader(hints);
      barcodeReaderRef.current = reader;

      log('ZXing barcode scanner is ready.');
    } catch (error: any) {
      console.error('Error setting up ZXing barcode scanner:', error);
      toast.error(`Failed to setup barcode scanner: ${error.message}`);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true)
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(async () => {
        return await navigator.mediaDevices.getUserMedia({ video: true })
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        log('Camera started.')
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      toast.error(`Could not access camera: ${error.message}`)
    }
  }

  const stopCamera = () => {
    setIsCameraActive(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      log('Camera stopped.')
    }
  }

  const handleScanModeChange = (mode: 'text' | 'barcode') => {
    stopCamera()
    setScanMode(mode)
    setVinData({
      vin: null,
      confidence: 0,
      valid: false,
      nhtsaLookup: null,
      nhtsaValid: false
    })
  }

  const handleManualVinSubmit = async () => {
    if (!manualVin) {
      toast.error('Please enter a VIN.')
      return
    }

    await processVin(manualVin)
  }

  const handleCancel = () => {
    stopCamera()
    navigate(returnPath)
  }

  const handleConfirm = () => {
    stopCamera()
    navigate(returnPath, { state: { vin: vinData.vin } })
  }

  const handleRescan = () => {
    setIsConfirmationView(false)
    setVinData({
      vin: null,
      confidence: 0,
      valid: false,
      nhtsaLookup: null,
      nhtsaValid: false
    })
    startCamera()
  }

  const handleScan = async () => {
    if (scanMode === 'text') {
      await scanText()
    } else if (scanMode === 'barcode') {
      await scanBarcode()
    }
  }

  const scanText = async () => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current) {
      toast.error('Camera or OCR engine not ready. Please wait and try again.')
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      toast.error('Could not get canvas context.')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = preprocessImage(canvas)

    setIsOcrLoading(true)
    try {
      log('Starting OCR...')
      const { data } = await workerRef.current.recognize(imageData)
      const rawText = data.text
      log(`Raw OCR Text: ${rawText}`)

      const processedVin = postProcessVIN(rawText)
      log(`Processed VIN: ${processedVin}`)

      await processVin(processedVin, data.confidence)
    } catch (error: any) {
      console.error('OCR Error:', error)
      toast.error(`OCR failed: ${error.message}`)
    } finally {
      setIsOcrLoading(false)
    }
  }

  const scanBarcode = async () => {
    if (!videoRef.current || !barcodeReaderRef.current) {
      toast.error('Camera or barcode scanner not ready. Please wait and try again.')
      return
    }

    setIsOcrLoading(true)
    try {
      log('Starting barcode scan...')
      const videoEl = videoRef.current
      const result = await barcodeReaderRef.current.decodeFromVideoElement(videoEl)
      const rawText = result.getText()
      log(`Raw Barcode Text: ${rawText}`)

      const processedVin = postProcessVIN(rawText)
      log(`Processed VIN: ${processedVin}`)

      await processVin(processedVin)
    } catch (error: any) {
      console.error('Barcode Scan Error:', error)
      toast.error(`Barcode scan failed: ${error.message}`)
    } finally {
      setIsOcrLoading(false)
    }
  }

  const processVin = async (vin: string, confidence: number = 0) => {
    log(`Validating VIN: ${vin}`)
    const isValid = validateVIN(vin)

    setVinData(prev => ({
      ...prev,
      vin,
      confidence,
      valid: isValid,
      nhtsaLookup: null,
      nhtsaValid: false
    }))

    if (isValid) {
      log('VIN is valid. Looking up NHTSA data...')
      await lookupNHTSA(vin)
    } else {
      toast.error('Invalid VIN format.')
      setIsConfirmationView(true)
    }
  }

  const lookupNHTSA = async (vin: string) => {
    setIsNHTSALookupLoading(true)
    try {
      const nhtsaData = await validateVinWithNHTSA(vin)
      const nhtsaValid = nhtsaData !== null

      setVinData(prev => ({
        ...prev,
        nhtsaLookup: nhtsaData,
        nhtsaValid
      }))

      if (!nhtsaValid) {
        toast.error('VIN not found in NHTSA database.')
      }

      setIsConfirmationView(true)
    } catch (error: any) {
      console.error('NHTSA Lookup Error:', error)
      toast.error(`NHTSA lookup failed: ${error.message}`)
    } finally {
      setIsNHTSALookupLoading(false)
    }
  }

  const log = (message: string) => {
    setLogs(prevLogs => [...prevLogs, message])
  }

  const handleScanModeChangePreset = async (preset: OcrPreset) => {
    setCurrentPreset(preset)
    setIsOcrSettingsOpen(false)

    if (workerRef.current) {
      try {
        await workerRef.current.setParameters(preset.config)
        toast.success(`OCR preset changed to ${preset.name}`)
      } catch (error: any) {
        console.error('Error setting OCR parameters:', error)
        toast.error(`Failed to set OCR parameters: ${error.message}`)
      }
    }
  }
  
  const updateMorphKernelSize = (size: string) => {
    setMorphKernelSize(size)
    
    const savedSettings = JSON.parse(localStorage.getItem('scanner-settings') || '{}')
    savedSettings.morphKernelSize = size
    localStorage.setItem('scanner-settings', JSON.stringify(savedSettings))
    
    toast.success(`Morphological kernel size set to ${size}x${size}`)
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Scan VIN</h1>
          <p className="text-sm text-muted-foreground">
            {isConfirmationView 
              ? "Verify the scanned VIN information" 
              : `Point your camera at a VIN ${scanMode === 'text' ? 'text' : 'barcode'} or manually enter the VIN`}
          </p>
        </div>
      </div>

      {isConfirmationView ? (
        <Card>
          <CardHeader>
            <CardTitle>Confirm VIN Details</CardTitle>
            <CardDescription>
              Please verify the following information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Scanned VIN:</p>
              <p className="text-lg font-semibold">{vinData.vin}</p>
              {vinData.confidence > 0 && (
                <Badge variant="secondary">Confidence: {vinData.confidence.toFixed(2)}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">VIN Status:</p>
              {vinData.valid ? (
                <Badge variant="outline">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Valid VIN Format
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Invalid VIN Format
                </Badge>
              )}
              {isNHTSALookupLoading ? (
                <Badge variant="secondary">
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Looking up NHTSA Data...
                </Badge>
              ) : vinData.nhtsaValid ? (
                <Badge variant="outline">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Found in NHTSA Database
                </Badge>
              ) : vinData.nhtsaLookup === null ? null : (
                <Badge variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Not Found in NHTSA Database
                </Badge>
              )}
            </div>

            {vinData.nhtsaLookup && (
              <Collapsible>
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">NHTSA Data</p>
                    <Info className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-xs mt-2 p-2 rounded bg-muted">
                    {JSON.stringify(vinData.nhtsaLookup, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleRescan}>
              Rescan
            </Button>
            <Button onClick={handleConfirm} disabled={!vinData.valid}>
              Confirm
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex w-full sm:w-auto gap-2">
              <Toggle
                pressed={scanMode === 'text'}
                onPressedChange={() => handleScanModeChange('text')}
                className={`flex-1 h-8 ${scanMode === 'text' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border'}`}
              >
                <AlignLeft className="mr-1 h-3 w-3" />
                Text Mode
              </Toggle>
              
              <Toggle
                pressed={scanMode === 'barcode'}
                onPressedChange={() => handleScanModeChange('barcode')}
                className={`flex-1 h-8 ${scanMode === 'barcode' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border'}`}
              >
                <Barcode className="mr-1 h-3 w-3" />
                Barcode Mode
              </Toggle>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsQuickSettingsOpen(true)}
              >
                <Sliders className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLogs(!showLogs)}
              >
                <AlignLeft className="h-4 w-4 mr-1" />
                Logs
              </Button>
            </div>
          </div>

          {scanMode === 'text' && (
            <div className="mb-4">
              <Label htmlFor="morph-kernel-size" className="mb-2 block text-sm">Morphological Kernel Size</Label>
              <Select
                value={morphKernelSize}
                onValueChange={updateMorphKernelSize}
              >
                <SelectTrigger id="morph-kernel-size" className="w-full">
                  <SelectValue placeholder="Select kernel size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x1 (No effect)</SelectItem>
                  <SelectItem value="3">3x3 (Light)</SelectItem>
                  <SelectItem value="5">5x5 (Medium)</SelectItem>
                  <SelectItem value="7">7x7 (Strong)</SelectItem>
                  <SelectItem value="9">9x9 (Very Strong)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Controls the thickness of characters. Larger values help with faded text.
              </p>
            </div>
          )}
          
          {scanMode === 'text' && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                className="w-full flex justify-between items-center" 
                onClick={() => setIsOcrSettingsOpen(true)}
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  OCR Settings
                </div>
                <span className="ml-auto text-sm text-muted-foreground">
                  {currentPreset.name}
                </span>
              </Button>
            </div>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video rounded-md bg-black"
              autoPlay
              muted
              playsInline
            />
            {isOcrLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                <RotateCcw className="h-10 w-10 animate-spin text-white" />
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleScan}
            disabled={isOcrLoading || !isCameraActive}
          >
            {isOcrLoading ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : isCameraActive ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Scan
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Enable Camera
              </>
            )}
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter VIN manually"
              value={manualVin}
              onChange={(e) => setManualVin(e.target.value.toUpperCase())}
              className="flex-1"
              maxLength={17}
            />
            <Button onClick={handleManualVinSubmit} disabled={isOcrLoading}>
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>

          {showLogs && (
            <Card>
              <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>
                  Detailed logs of the scanning process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="text-xs">
                    {logs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Dialog open={isOcrSettingsOpen} onOpenChange={setIsOcrSettingsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>OCR Settings</DialogTitle>
                <DialogDescription>
                  Adjust the OCR engine parameters for better text recognition.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {currentPreset.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select a preset</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ocrPresets.map(preset => (
                      <DropdownMenuItem key={preset.name} onClick={() => handleScanModeChangePreset(preset)}>
                        {preset.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setIsOcrSettingsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isQuickSettingsOpen} onOpenChange={setIsQuickSettingsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Settings</DialogTitle>
                <DialogDescription>
                  Adjust common scanning parameters
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quickMorphKernelSize">Morphological Kernel Size</Label>
                  <Select
                    value={morphKernelSize}
                    onValueChange={updateMorphKernelSize}
                  >
                    <SelectTrigger id="quickMorphKernelSize">
                      <SelectValue placeholder="Select kernel size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x1 (No effect)</SelectItem>
                      <SelectItem value="3">3x3 (Light)</SelectItem>
                      <SelectItem value="5">5x5 (Medium)</SelectItem>
                      <SelectItem value="7">7x7 (Strong)</SelectItem>
                      <SelectItem value="9">9x9 (Very Strong)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls the thickness of text characters. Larger values help with faded text.
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="quick-edge-enhancement" className="flex-1">
                    Edge Enhancement
                    <p className="text-xs text-muted-foreground">
                      Improves edge detection for clearer text
                    </p>
                  </Label>
                  <Switch
                    id="quick-edge-enhancement"
                    checked={settings?.edgeEnhancement ?? true}
                    onCheckedChange={(checked) => {
                      const savedSettings = JSON.parse(localStorage.getItem('scanner-settings') || '{}')
                      savedSettings.edgeEnhancement = checked
                      localStorage.setItem('scanner-settings', JSON.stringify(savedSettings))
                      toast.success(`Edge enhancement ${checked ? 'enabled' : 'disabled'}`)
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="quick-noise-reduction" className="flex-1">
                    Noise Reduction
                    <p className="text-xs text-muted-foreground">
                      Removes speckles and artifacts from the image
                    </p>
                  </Label>
                  <Switch
                    id="quick-noise-reduction"
                    checked={settings?.noiseReduction ?? true}
                    onCheckedChange={(checked) => {
                      const savedSettings = JSON.parse(localStorage.getItem('scanner-settings') || '{}')
                      savedSettings.noiseReduction = checked
                      localStorage.setItem('scanner-settings', JSON.stringify(savedSettings))
                      toast.success(`Noise reduction ${checked ? 'enabled' : 'disabled'}`)
                    }}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => navigate('/admin/developer-settings')}>
                  Advanced Settings
                </Button>
                <Button onClick={() => setIsQuickSettingsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
