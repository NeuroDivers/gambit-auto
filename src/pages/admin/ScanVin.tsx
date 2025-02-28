
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Clipboard, RotateCcw, Check, AlignLeft, Barcode, Info, Play, Pause, FileText } from "lucide-react"
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
import { SettingsSelector } from "@/components/shared/settings/SettingsSelector"

interface VinData {
  vin: string | null
  confidence: number
  valid: boolean
  nhtsaLookup: any | null
  nhtsaValid: boolean
  vehicleInfo?: {
    make: string
    model: string
    year: number
    trim: string
  }
}

interface OcrPreset {
  name: string
  config: {
    tessedit_pageseg_mode: PSM
    tessedit_char_whitelist?: string
  }
  description?: string
}

const ocrPresets: OcrPreset[] = [
  {
    name: "Default",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Balanced settings for most VIN scanning scenarios"
  },
  {
    name: "Windshield VIN",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Optimized for reading VINs through windshield glass"
  },
  {
    name: "Low Light",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Enhanced for poor lighting conditions"
  },
  {
    name: "High Contrast",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_WORD,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "For VINs with strong contrast against background"
  },
  {
    name: "Metal Plate",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Optimized for stamped metal VIN plates"
  },
  {
    name: "Sticker VIN",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "For printed sticker VINs (door jamb, etc.)"
  },
  {
    name: "Faded Text",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "For worn or faded VIN characters"
  },
  {
    name: "High Precision",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Slower but more accurate scanning"
  },
  {
    name: "Fast Scan",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_WORD,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Quicker but less accurate scanning"
  },
  {
    name: "Monitor/Screen",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Basic settings for VINs displayed on digital screens"
  },
  {
    name: "Advanced Monitor VIN",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Specialized processing for screens with anti-aliasing"
  },
  {
    name: "Auto-Adjusting Monitor",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Automatically adapts to different screen conditions"
  },
  {
    name: "High Refresh Rate Screen",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "For OLED or high refresh rate displays (90Hz+)"
  },
  {
    name: "Moving/Handheld Camera",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Reduces motion blur while scanning on the move"
  },
  {
    name: "High Brightness/Glare",
    config: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
    },
    description: "Handles bright lighting conditions and glare"
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
      // Create worker
      const worker = createWorker();
      
      // Wait for worker to initialize
      workerRef.current = await worker;
      
      // Set parameters
      await workerRef.current.setParameters(currentPreset.config);
      
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
        setIsCameraActive(true)
        log('Camera started.')
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      toast.error(`Could not access camera: ${error.message}`)
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      log('Camera stopped.')
    }
    setIsCameraActive(false)
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

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  const handleScan = async () => {
    if (!isCameraActive) {
      toast.error('Camera is not active. Please enable the camera first.')
      return
    }
    
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

      // Skip if the OCR result is empty
      if (!rawText || rawText.trim() === '') {
        log('OCR returned empty result, retrying...')
        setIsOcrLoading(false)
        toast.info('No text detected. Please adjust camera position and try again.')
        return
      }

      const processedVin = postProcessVIN(rawText)
      log(`Processed VIN: ${processedVin}`)

      // Skip if the processed VIN is empty
      if (!processedVin || processedVin.trim() === '') {
        log('Processed VIN is empty, skipping validation')
        setIsOcrLoading(false)
        toast.info('Could not extract a VIN from the image. Please try again.')
        return
      }

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
      
      try {
        const result = await barcodeReaderRef.current.decodeFromVideoElement(videoEl)
        const rawText = result.getText()
        log(`Raw Barcode Text: ${rawText}`)

        // Skip if the barcode result is empty
        if (!rawText || rawText.trim() === '') {
          log('Barcode scan returned empty result')
          toast.info('No barcode detected. Please adjust camera position and try again.')
          return
        }

        const processedVin = postProcessVIN(rawText)
        log(`Processed VIN: ${processedVin}`)

        // Skip if the processed VIN is empty
        if (!processedVin || processedVin.trim() === '') {
          log('Processed VIN is empty, skipping validation')
          toast.info('Could not extract a VIN from the barcode. Please try again.')
          return
        }

        await processVin(processedVin)
      } catch (scanError: any) {
        // This is normal when no barcode is found
        log('No barcode found in current frame')
        toast.info('No barcode detected. Please adjust camera position and try again.')
      }
    } catch (error: any) {
      console.error('Barcode Scan Error:', error)
      toast.error(`Barcode scan failed: ${error.message}`)
    } finally {
      setIsOcrLoading(false)
    }
  }

  // Helper function to extract value from NHTSA results
  const getValueFromNHTSA = (results: any[], variableName: string): string => {
    if (!results || !Array.isArray(results)) return '';
    const found = results.find(item => item.Variable === variableName);
    return found && found.Value !== null ? found.Value : '';
  };

  // Helper function to combine strings and remove duplicates
  const combineAndDeduplicate = (strings: string[], modelToFilter: string = ''): string => {
    // Filter out empty strings
    const validStrings = strings.filter(str => !!str);
    if (validStrings.length === 0) return '';
    
    // Split each string into words, flatten the array
    const allWords = validStrings.flatMap(str => str.split(/\s+/));
    
    // Split model into words to check for duplicates
    const modelWords = new Set(
      modelToFilter.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    );
    
    // Use a Set to track which words we've seen (in lowercase for comparison)
    const seenWords = new Set<string>();
    const uniqueWords: string[] = [];
    
    // Keep the original casing but use lowercase for duplicate detection
    // and filter out any words that are also in the model
    allWords.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (!seenWords.has(lowerWord) && !modelWords.has(lowerWord)) {
        seenWords.add(lowerWord);
        uniqueWords.push(word);
      }
    });
    
    return uniqueWords.join(' ');
  };

  const processVin = async (vin: string, confidence: number = 0) => {
    // Skip processing if VIN is empty
    if (!vin || vin.trim() === '') {
      log('Empty VIN received, skipping processing')
      return
    }
    
    log(`Validating VIN: ${vin}`)
    const isValid = validateVIN(vin)

    setVinData(prev => ({
      ...prev,
      vin,
      confidence,
      valid: isValid,
      nhtsaLookup: null,
      nhtsaValid: false,
      vehicleInfo: undefined
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
      
      // Fix: Check if nhtsaData is an object with Results property
      const nhtsaValid = nhtsaData !== null && typeof nhtsaData === 'object' && 'Results' in nhtsaData;

      if (nhtsaValid && nhtsaData && nhtsaData.Results) {
        // Extract vehicle information
        const make = getValueFromNHTSA(nhtsaData.Results, 'Make');
        const model = getValueFromNHTSA(nhtsaData.Results, 'Model');
        const yearStr = getValueFromNHTSA(nhtsaData.Results, 'Model Year');
        const year = yearStr ? parseInt(yearStr, 10) : 0;
        
        // Get trim information
        const trim = getValueFromNHTSA(nhtsaData.Results, 'Trim');
        const trim2 = getValueFromNHTSA(nhtsaData.Results, 'Trim2');
        const series = getValueFromNHTSA(nhtsaData.Results, 'Series');
        const series2 = getValueFromNHTSA(nhtsaData.Results, 'Series2');
        
        // Combine and deduplicate trim information
        const combinedTrim = combineAndDeduplicate([trim, trim2, series, series2], model);
        
        log(`Vehicle Make: ${make}, Model: ${model}, Year: ${year}, Trim: ${combinedTrim}`);

        setVinData(prev => ({
          ...prev,
          nhtsaLookup: nhtsaData,
          nhtsaValid: true,
          vehicleInfo: {
            make,
            model,
            year,
            trim: combinedTrim
          }
        }));
      } else {
        setVinData(prev => ({
          ...prev,
          nhtsaLookup: nhtsaData,
          nhtsaValid: false
        }));
        toast.error('VIN not found in NHTSA database.');
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

            {vinData.vehicleInfo && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-sm font-medium">Vehicle Information:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Make</p>
                    <p className="font-medium">{vinData.vehicleInfo.make || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">{vinData.vehicleInfo.model || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="font-medium">{vinData.vehicleInfo.year || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trim</p>
                    <p className="font-medium">{vinData.vehicleInfo.trim || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 border-t pt-3">
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
            <div className="flex w-full sm:w-[80%] gap-2">
              <Toggle
                pressed={scanMode === 'text'}
                onPressedChange={() => handleScanModeChange('text')}
                className={`flex-1 h-8 px-3 ${scanMode === 'text' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border'}`}
              >
                <AlignLeft className="mr-1 h-3 w-3" />
                Text Mode
              </Toggle>
              
              <Toggle
                pressed={scanMode === 'barcode'}
                onPressedChange={() => handleScanModeChange('barcode')}
                className={`flex-1 h-8 px-3 ${scanMode === 'barcode' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border'}`}
              >
                <Barcode className="mr-1 h-3 w-3" />
                Barcode Mode
              </Toggle>
            </div>
            <div className="flex ml-auto">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowLogs(!showLogs)}
                className="w-8 h-8 p-0"
                title="Show Logs"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {scanMode === 'text' && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                className="w-full flex justify-between items-center" 
                onClick={() => setIsOcrSettingsOpen(true)}
              >
                <div className="flex items-center">
                  <AlignLeft className="h-4 w-4 mr-2" />
                  OCR Preset
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
            onClick={toggleCamera}
            variant={isCameraActive ? "secondary" : "default"}
          >
            {isCameraActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Enable Camera
              </>
            )}
          </Button>

          <Button
            className="w-full"
            onClick={handleScan}
            disabled={isOcrLoading || !isCameraActive}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Scan
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
                  Select a preset for OCR text recognition.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-1 gap-4">
                    {ocrPresets.map((preset) => (
                      <Card 
                        key={preset.name}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          currentPreset.name === preset.name ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleScanModeChangePreset(preset)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            {currentPreset.name === preset.name && (
                              <Check className="h-4 w-4 mr-2 text-primary" />
                            )}
                            {preset.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsOcrSettingsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
