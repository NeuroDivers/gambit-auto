
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BrowserMultiFormatReader } from '@zxing/library'
import { createWorker } from 'tesseract.js'
import { ArrowLeft, Camera, Clipboard, Text, Barcode, List, CheckCircle, XCircle, RotateCcw, Loader2 } from "lucide-react"
import { toast } from 'sonner'
import { Toggle } from "@/components/ui/toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { postProcessVIN } from '@/utils/vin-validation'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interface for OCR settings from developer settings
interface OCRSettings {
  blueEmphasis: 'zero' | 'normal' | 'high' | 'very-high';
  contrast: 'normal' | 'high' | 'very-high';
  morphKernelSize: '2' | '3' | '4';
  confidenceThreshold: '35' | '40' | '45';
  grayscaleMethod: 'luminosity' | 'average' | 'blue-channel';
  autoInvert: boolean;
  autoInvertDark: boolean;
  edgeEnhancement: boolean;
  noiseReduction: boolean;
  adaptiveContrast: boolean;
  tesseractConfig: {
    psm: 6 | 7 | 8 | 13;
    oem: 1 | 3;
  }
}

// Default OCR settings if none are found
const defaultOCRSettings: OCRSettings = {
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
  tesseractConfig: {
    psm: 7,
    oem: 1
  }
};

export default function VinScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/admin/estimates'
  const returnPath = returnTo || '/admin/estimates'
  const navigate = useNavigate()
  const [manualVin, setManualVin] = useState('')
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [logsOpen, setLogsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [worker, setWorker] = useState<Tesseract.Worker | null>(null)
  const scanIntervalRef = useRef<number | null>(null)
  const [scannedVin, setScannedVin] = useState<string | null>(null)
  const [vehicleInfo, setVehicleInfo] = useState<{
    make?: string;
    model?: string;
    year?: number;
  } | null>(null)
  const [isLoadingVinInfo, setIsLoadingVinInfo] = useState(false)
  const [ocrSettings, setOcrSettings] = useState<OCRSettings>(defaultOCRSettings)
  const [activePresetName, setActivePresetName] = useState<string>("Default OCR Settings")

  // Load OCR settings from localStorage
  useEffect(() => {
    try {
      // Get scanner settings
      const savedSettings = localStorage.getItem('scanner-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setOcrSettings(settings)
        addLog("Loaded OCR settings from localStorage")
      }

      // Get active preset name
      const savedPresets = localStorage.getItem('scanner-presets')
      if (savedPresets) {
        const presets = JSON.parse(savedPresets)
        const activePreset = presets.find((p: any) => 
          p.settings === ocrSettings || 
          JSON.stringify(p.settings) === JSON.stringify(ocrSettings)
        )
        if (activePreset) {
          setActivePresetName(activePreset.name)
          addLog(`Using OCR preset: ${activePreset.name}`)
        }
      }
    } catch (error) {
      console.error('Error loading OCR settings:', error)
      addLog(`Error loading OCR settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    
    // Also save to scanner-logs in localStorage
    try {
      const existingLogs = JSON.parse(localStorage.getItem('scanner-logs') || '[]')
      const newLog = {
        timestamp: new Date().toISOString(),
        message,
        type: 'info'
      }
      const updatedLogs = [...existingLogs, newLog].slice(-100) // Keep last 100 logs
      localStorage.setItem('scanner-logs', JSON.stringify(updatedLogs))
    } catch (error) {
      console.error('Error saving log:', error)
    }
  }

  // Helper to determine actual contrast values based on settings
  const getContrastValues = (contrastSetting: 'normal' | 'high' | 'very-high') => {
    switch (contrastSetting) {
      case 'normal': 
        return { low: 0.5, high: 1.5 }
      case 'high': 
        return { low: 0.4, high: 1.7 }
      case 'very-high': 
        return { low: 0.3, high: 1.9 }
      default: 
        return { low: 0.5, high: 1.5 }
    }
  }

  // Helper to determine blue channel emphasis value
  const getBlueEmphasisValue = (setting: 'zero' | 'normal' | 'high' | 'very-high') => {
    switch (setting) {
      case 'zero': return 0.33
      case 'normal': return 0.5
      case 'high': return 0.7
      case 'very-high': return 0.8
      default: return 0.33
    }
  }

  // Fetch vehicle info for a given VIN
  const fetchVehicleInfo = async (vin: string) => {
    if (!vin || vin.length !== 17) return null
    
    try {
      setIsLoadingVinInfo(true)
      addLog(`Fetching vehicle info for VIN: ${vin}`)
      
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
      if (!response.ok) {
        throw new Error(`NHTSA API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.Results || !Array.isArray(data.Results)) {
        throw new Error('Invalid response format from NHTSA API')
      }
      
      const makeInfo = data.Results.find((r: any) => r.Variable === 'Make')
      const modelInfo = data.Results.find((r: any) => r.Variable === 'Model')
      const yearInfo = data.Results.find((r: any) => r.Variable === 'Model Year')
      
      const info = {
        make: makeInfo?.Value || undefined,
        model: modelInfo?.Value || undefined,
        year: yearInfo?.Value ? parseInt(yearInfo.Value) : undefined
      }
      
      addLog(`Vehicle info retrieved: ${info.year} ${info.make} ${info.model}`)
      return info
    } catch (error) {
      console.error('Error fetching vehicle info:', error)
      addLog(`Error fetching vehicle info: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    } finally {
      setIsLoadingVinInfo(false)
    }
  }

  // Initialize Tesseract worker with custom settings
  useEffect(() => {
    const initWorker = async () => {
      try {
        addLog(`Initializing OCR engine with preset: ${activePresetName}`)
        
        // Configure Tesseract based on settings
        const { tesseractConfig } = ocrSettings
        
        // Create Tesseract worker with the language model
        const newWorker = await createWorker('eng')
        
        // Set parameters after worker creation
        await newWorker.setParameters({
          tessedit_pageseg_mode: tesseractConfig.psm.toString(),
          tessedit_ocr_engine_mode: tesseractConfig.oem.toString(),
        })
        
        addLog(`OCR engine initialized with PSM=${tesseractConfig.psm}, OEM=${tesseractConfig.oem}`)
        setWorker(newWorker)
      } catch (err) {
        console.error('Failed to initialize Tesseract worker:', err)
        addLog(`Failed to initialize OCR engine: ${err instanceof Error ? err.message : 'Unknown error'}`)
        toast.error('Error initializing text recognition. Try barcode mode instead.')
      }
    }

    initWorker()

    return () => {
      if (worker) {
        worker.terminate()
        addLog("OCR engine terminated")
      }
    }
  }, [ocrSettings])

  // When a VIN is scanned or entered manually, fetch vehicle info
  useEffect(() => {
    if (scannedVin) {
      fetchVehicleInfo(scannedVin).then(info => {
        setVehicleInfo(info)
      })
    } else {
      setVehicleInfo(null)
    }
  }, [scannedVin])

  // Validate VIN with advanced rules including check digit
  const validateVinWithCheckDigit = (vin: string): boolean => {
    // Basic VIN pattern validation
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      addLog("VIN failed pattern validation")
      return false
    }
    
    // Check digit validation (9th character)
    // Convert characters to their numeric values
    const values: {[key: string]: number} = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
      'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
    }
    
    // Weight factors for each position
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
    
    // Calculate check digit
    let sum = 0
    for (let i = 0; i < 17; i++) {
      if (i !== 8) { // Skip the check digit position
        const char = vin.charAt(i)
        const value = values[char]
        sum += value * weights[i]
      }
    }
    
    // Calculate the remainder modulo 11
    const remainder = sum % 11
    
    // Determine the expected check digit
    const expectedCheckDigit = remainder === 10 ? 'X' : remainder.toString()
    
    // Get the actual check digit from the VIN
    const actualCheckDigit = vin.charAt(8)
    
    // Compare the expected and actual check digits
    const isValid = actualCheckDigit === expectedCheckDigit
    
    if (!isValid) {
      addLog(`VIN check digit validation failed: expected ${expectedCheckDigit}, got ${actualCheckDigit}`)
    } else {
      addLog("VIN check digit validation passed")
    }
    
    return isValid
  }

  // Barcode scanning setup
  useEffect(() => {
    if (scanMode !== 'barcode' || scannedVin) return
    
    addLog('Starting barcode scanner')
    
    const codeReader = new BrowserMultiFormatReader()
    let selectedDeviceId: string | undefined

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length <= 0) {
          const errorMsg = 'No video input devices detected'
          console.error(errorMsg)
          addLog(errorMsg)
          return
        }

        // Log available devices
        videoInputDevices.forEach(device => {
          addLog(`Found camera: ${device.label || 'Unnamed camera'}`)
        })

        // Select the rear camera if available, otherwise use the first camera
        const rearCamera = videoInputDevices.find(device => 
          /back|rear/i.test(device.label)
        )
        selectedDeviceId = rearCamera?.deviceId || videoInputDevices[0].deviceId
        
        addLog(`Selected camera: ${videoInputDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Unknown camera'}`)
        addLog(`Scan mode: ${scanMode}`)

        return codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const vinCode = result.getText()
              console.log('Scanned VIN barcode:', vinCode)
              addLog(`Successfully scanned barcode: ${vinCode}`)
              setScannedVin(vinCode)
              // Stop scanning once we have a result
              codeReader.reset()
            }
            if (error && !(error instanceof TypeError)) {
              // TypeError is thrown when the scanner is stopped, so we ignore it
              console.error('Scanner error:', error)
              // Only log certain errors to avoid flooding the log
              if (!error.message.includes('No MultiFormat Readers were able to detect the code')) {
                addLog(`Error: ${error.message || 'Unknown scanner error'}`)
              }
            }
          }
        )
      })
      .catch(err => {
        console.error('Error starting scanner:', err)
        addLog(`Failed to start scanner: ${err.message || 'Unknown error'}`)
        toast.error('Error accessing camera. Please check permissions.')
      })

    return () => {
      addLog('Barcode scanner stopped')
      codeReader.reset()
    }
  }, [scanMode, scannedVin])

  // Apply image processing based on settings
  const processImageForOCR = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas
    
    addLog(`Applying image processing with ${activePresetName} settings`)
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Apply grayscale based on method selected in settings
    const blueEmphasis = getBlueEmphasisValue(ocrSettings.blueEmphasis)
    
    // Apply method based on setting
    switch (ocrSettings.grayscaleMethod) {
      case 'luminosity':
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + blueEmphasis * data[i + 2]
          data[i] = data[i + 1] = data[i + 2] = gray
        }
        break
      case 'average':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = data[i + 1] = data[i + 2] = avg
        }
        break
      case 'blue-channel':
        for (let i = 0; i < data.length; i += 4) {
          // Emphasize blue channel
          data[i] = data[i + 1] = data[i + 2] = data[i + 2]
        }
        break
      default:
        // Default to luminosity if no method specified
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          data[i] = data[i + 1] = data[i + 2] = gray
        }
    }
    
    // Apply contrast adjustment
    if (ocrSettings.contrast !== 'normal') {
      const contrastValues = getContrastValues(ocrSettings.contrast)
      const factor = (259 * (contrastValues.high * 100 + 255)) / (255 * (259 - contrastValues.low * 100))
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128
        data[i + 1] = factor * (data[i + 1] - 128) + 128
        data[i + 2] = factor * (data[i + 2] - 128) + 128
      }
    }
    
    // Apply auto-invert if enabled
    if (ocrSettings.autoInvert) {
      // Simple check for light text on dark background
      let darkPixels = 0
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 128) darkPixels++
      }
      
      // If more than 60% of pixels are dark, invert for light text on dark background
      if (darkPixels > data.length / 4 * 0.6) {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]
          data[i + 1] = 255 - data[i + 1]
          data[i + 2] = 255 - data[i + 2]
        }
        addLog("Applied auto-invert (detected dark background)")
      }
    }
    
    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0)
    
    // Create a new canvas for threshold operation if needed
    const thresholdCanvas = document.createElement('canvas')
    thresholdCanvas.width = canvas.width
    thresholdCanvas.height = canvas.height
    const thresholdCtx = thresholdCanvas.getContext('2d')
    
    if (thresholdCtx) {
      // Draw the processed image to the new canvas
      thresholdCtx.drawImage(canvas, 0, 0)
      
      // Apply simple threshold for better OCR
      const thresholdData = thresholdCtx.getImageData(0, 0, thresholdCanvas.width, thresholdCanvas.height)
      const thresholdPixels = thresholdData.data
      
      for (let i = 0; i < thresholdPixels.length; i += 4) {
        const value = thresholdPixels[i] > 128 ? 255 : 0
        thresholdPixels[i] = thresholdPixels[i + 1] = thresholdPixels[i + 2] = value
      }
      
      thresholdCtx.putImageData(thresholdData, 0, 0)
      
      return thresholdCanvas
    }
    
    return canvas
  }

  // Text scanning setup
  useEffect(() => {
    if (scanMode !== 'text' || !worker || !videoRef.current || scannedVin) return

    addLog('Starting text scanner')
    
    // Setup camera for text scanning
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
    .then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Setup canvas for capturing frames
        if (!canvasRef.current) {
          const canvas = document.createElement('canvas')
          canvas.style.display = 'none'
          document.body.appendChild(canvas)
          canvasRef.current = canvas
        }
        
        addLog('Text scanner ready')
        
        // Start periodic scanning for text
        startTextScanning()
      }
    })
    .catch((err) => {
      console.error('Error accessing camera for text scanning:', err)
      addLog(`Failed to access camera: ${err.message || 'Unknown error'}`)
      toast.error('Error accessing camera. Please check permissions.')
    })
    
    return () => {
      stopTextScanning()
      
      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
        addLog('Text scanner stopped')
      }
    }
  }, [scanMode, worker, scannedVin])
  
  const startTextScanning = () => {
    if (isScanning || !worker) return
    
    setIsScanning(true)
    addLog('Starting text recognition')
    
    // Run OCR every 3 seconds
    scanIntervalRef.current = window.setInterval(captureAndRecognize, 3000)
  }
  
  const stopTextScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }
  
  const captureAndRecognize = async () => {
    if (!worker || !videoRef.current || !canvasRef.current) return
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Process the image using our settings before OCR
      const processedCanvas = processImageForOCR(canvas)
      
      // Process image with OCR
      addLog('Analyzing image for VIN...')
      const { data } = await worker.recognize(processedCanvas)
      
      // Process OCR result for potential VINs
      const text = data.text.replace(/\s+/g, '')
      addLog(`OCR detected text: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`)
      
      // Look for 17-character sequences that might be VINs
      const vinPattern = /[A-HJ-NPR-Z0-9]{17}/g
      const potentialVins = text.match(vinPattern)
      
      if (potentialVins && potentialVins.length > 0) {
        // Process and validate the potential VIN
        const vin = postProcessVIN(potentialVins[0])
        addLog(`Potential VIN detected: ${vin}`)
        
        // Additional validation with check digit
        const isValidVin = validateVinWithCheckDigit(vin)
        if (isValidVin) {
          addLog(`VIN validation successful: ${vin}`)
        } else {
          addLog(`Warning: VIN may be invalid, but continuing: ${vin}`)
        }
        
        // Pause scanning while processing result
        stopTextScanning()
        
        // Set as current scanned VIN
        setScannedVin(vin)
      }
    } catch (err) {
      console.error('Error in OCR process:', err)
      addLog(`OCR error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const confirmAndNavigate = () => {
    if (!scannedVin) return
    
    // Store result in sessionStorage to pass to the previous page
    console.log('VinScannerPage: Storing scanned VIN in sessionStorage:', scannedVin)
    addLog(`Storing VIN in session storage: ${scannedVin}`)
    sessionStorage.setItem('scanned-vin', scannedVin)
    
    // Also store vehicle info if available
    if (vehicleInfo) {
      sessionStorage.setItem('scanned-vin-info', JSON.stringify(vehicleInfo))
      addLog(`Storing vehicle info in session storage: ${JSON.stringify(vehicleInfo)}`)
    }
    
    toast.success(`VIN scanned: ${scannedVin}`)
    
    // A small delay to ensure the data is saved before navigation
    setTimeout(() => {
      addLog(`Navigating back to: ${returnPath}`)
      navigate(returnPath)
    }, 100)
  }

  const resetScan = () => {
    setScannedVin(null)
    setVehicleInfo(null)
    setManualVin('')
    addLog('Resetting scan, starting again')
  }

  const handlePasteVin = async () => {
    try {
      const text = await navigator.clipboard.readText()
      addLog(`Pasted text from clipboard: ${text}`)
      if (text && text.length >= 17) {
        setManualVin(text)
      }
    } catch (err) {
      console.error('Failed to read clipboard contents:', err)
      addLog(`Failed to access clipboard: ${err instanceof Error ? err.message : 'Unknown error'}`)
      toast.error('Could not access clipboard. Please enter VIN manually.')
    }
  }

  const handleUseManualVin = () => {
    addLog(`Using manually entered VIN: ${manualVin}`)
    if (manualVin.length >= 17) {
      setScannedVin(manualVin)
    } else {
      addLog(`Invalid VIN length: ${manualVin.length} (expected 17 or more)`)
      toast.error('Please enter a valid VIN (17 characters)')
    }
  }

  const navigateBack = () => {
    addLog(`User canceled. Returning to: ${returnPath}`)
    navigate(returnPath)
  }

  const toggleScanMode = () => {
    if (scannedVin) return // Don't toggle mode if we have a result
    
    // Stop current scanning processes
    stopTextScanning()
    
    // Toggle mode
    setScanMode(prevMode => prevMode === 'barcode' ? 'text' : 'barcode')
    addLog(`Changing scan mode from ${scanMode} to ${scanMode === 'barcode' ? 'text' : 'barcode'}`)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={navigateBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Scan VIN</CardTitle>
              <CardDescription>
                {scannedVin 
                  ? 'Verify the scanned VIN information'
                  : `Point your camera at a VIN ${scanMode === 'barcode' ? 'barcode' : 'text'} or manually enter the VIN`
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scannedVin ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Toggle 
                    pressed={scanMode === 'barcode'}
                    onPressedChange={toggleScanMode}
                    aria-label="Toggle scan mode"
                  >
                    {scanMode === 'barcode' ? <Barcode className="h-4 w-4 mr-1" /> : <Text className="h-4 w-4 mr-1" />}
                    {scanMode === 'barcode' ? 'Barcode' : 'Text'} Mode
                  </Toggle>
                </div>
                <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      <List className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>

              <div className="text-xs text-muted-foreground mb-2">
                Using preset: {activePresetName}
              </div>

              <div className="bg-black relative rounded-md overflow-hidden aspect-video">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 border-2 border-primary/50 rounded-md pointer-events-none" />
                {isScanning && scanMode === 'text' && (
                  <div className="absolute bottom-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    Scanning for VIN...
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualVin}
                    onChange={(e) => setManualVin(e.target.value)}
                    placeholder="Enter VIN manually"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={handlePasteVin}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleUseManualVin}>Use</Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-muted/50">
                <div className="flex flex-col space-y-2">
                  <AlertTitle className="text-lg font-bold">Scanned VIN</AlertTitle>
                  <AlertDescription className="text-xl font-mono">
                    {scannedVin}
                  </AlertDescription>
                </div>
              </Alert>
              
              {isLoadingVinInfo ? (
                <div className="flex justify-center p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Looking up vehicle information...</span>
                  </div>
                </div>
              ) : vehicleInfo ? (
                <Alert className="bg-green-50 dark:bg-green-950/30">
                  <div className="flex flex-col space-y-2">
                    <AlertTitle className="flex items-center text-green-800 dark:text-green-300">
                      <CheckCircle className="h-4 w-4 mr-2" /> 
                      Vehicle Information
                    </AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                    </AlertDescription>
                  </div>
                </Alert>
              ) : (
                <Alert className="bg-yellow-50 dark:bg-yellow-950/30">
                  <div className="flex flex-col space-y-2">
                    <AlertTitle className="flex items-center text-yellow-800 dark:text-yellow-300">
                      <XCircle className="h-4 w-4 mr-2" /> 
                      Cannot Verify Vehicle
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                      Unable to decode this VIN. You can still use it, but vehicle details won't be automatically filled.
                    </AlertDescription>
                  </div>
                </Alert>
              )}
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={resetScan}
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Scan Again
                </Button>
                <Button
                  onClick={confirmAndNavigate}
                  className="flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Use This VIN
                </Button>
              </div>
            </div>
          )}

          <Collapsible open={logsOpen}>
            <CollapsibleContent>
              <div className="border rounded-md mt-2 bg-gray-50 dark:bg-gray-900">
                <div className="p-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                  {logs.length === 0 ? (
                    <p>No logs yet</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="py-0.5">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={navigateBack}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
