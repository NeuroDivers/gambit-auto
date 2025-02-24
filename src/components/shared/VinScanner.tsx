
import { Camera, Barcode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { createWorker } from 'tesseract.js'
import { BrowserMultiFormatReader, Result } from '@zxing/library'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PSM } from 'tesseract.js'
import { useIsMobile } from "@/hooks/use-mobile"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const isMobile = useIsMobile()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const initializeWorker = async () => {
    try {
      addLog('Initializing OCR worker with enhanced VIN optimizations...')
      const worker = await createWorker()
      
      // Enhanced OCR settings for better mobile performance
      await worker.reinitialize('eng')
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHJKLMNPRSTUVWXYZ',
        tessedit_ocr_engine_mode: '2', // LSTM neural network mode
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        debug_file: '/dev/null',
        // Mobile-optimized parameters
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        tessedit_do_invert: '0', // Let preprocessing handle inversion
        textord_heavy_nr: '1', // Enable noise removal
        textord_min_linesize: '2.5', // Adjust for mobile camera resolution
        thresh_binarization: 'otsu', // Use Otsu's method for binarization
        tessedit_dpi: isMobile ? '200' : '70', // Adjust DPI based on device
      })

      addLog('OCR worker initialized with mobile-optimized parameters')
      return worker
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`)
      throw error
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current)
    }
    if (barcodeReaderRef.current) {
      barcodeReaderRef.current.reset()
      barcodeReaderRef.current = null
    }
    setIsCameraActive(false)
    setIsScanning(false)
  }

  const startCamera = async () => {
    try {
      const constraints: MediaTrackConstraints = {
        facingMode: 'environment',
        width: { ideal: isMobile ? 1920 : 1280 },
        height: { ideal: isMobile ? 1080 : 720 },
        frameRate: { ideal: 30 },
        // Advanced constraints are properly typed in MediaTrackConstraints
        advanced: [{
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous',
        }]
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: constraints })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        addLog('Stream acquired, initializing camera...')
        
        // Configure video track settings for mobile
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack && isMobile) {
          try {
            // Use proper constraint types
            const advancedConstraints: MediaTrackConstraints = {
              advanced: [{
                focusMode: 'continuous',
                exposureMode: 'continuous'
              }]
            }
            await videoTrack.applyConstraints(advancedConstraints)
            addLog('Applied mobile-optimized camera settings')
          } catch (error) {
            addLog('Could not apply advanced camera settings: ' + error)
          }
        }

        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        addLog('Video stream started')

        if (scanMode === 'text') {
          addLog('Starting OCR initialization...')
          workerRef.current = await initializeWorker()
          addLog('Worker reference created')
          
          addLog('Setting scanning state...')
          let isCurrentlyScanning = true
          setIsScanning(isCurrentlyScanning)
          
          addLog(`Starting OCR scanning...`)
          await startOCRScanning(isCurrentlyScanning)
        } else {
          addLog('Initializing barcode reader...')
          await initializeBarcodeScanner()
        }
      }
    } catch (error) {
      addLog(`Error accessing camera: ${error}`)
      toast.error("Could not access camera. Please check camera permissions.")
      setIsDialogOpen(false)
    }
  }

  const initializeBarcodeScanner = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader()
      barcodeReaderRef.current = codeReader

      if (videoRef.current) {
        addLog('Starting barcode scanning...')
        
        const scanLoop = async () => {
          try {
            if (!videoRef.current || !barcodeReaderRef.current) return;
            
            const result = await barcodeReaderRef.current.decodeOnce(videoRef.current);
            if (result?.getText()) {
              const scannedValue = result.getText()
              addLog(`Barcode detected: ${scannedValue}`)
              
              if (validateVIN(scannedValue)) {
                addLog('Valid VIN detected!')
                onScan(scannedValue.toUpperCase())
                toast.success("VIN scanned successfully")
                handleClose()
                return
              } else {
                addLog('Invalid VIN format detected')
              }
            }
          } catch (error: any) {
            if (error?.name !== 'NotFoundException') {
              addLog(`Barcode scan error: ${error}`)
            }
          }
          
          if (isDialogOpen) {
            requestAnimationFrame(scanLoop)
          }
        }
        
        scanLoop()
      }
    } catch (error) {
      addLog(`Error initializing barcode scanner: ${error}`)
      throw error
    }
  }

  const validateVIN = (vin: string): boolean => {
    if (vin.length !== 17) return false;

    const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!validVINPattern.test(vin)) return false;

    const suspiciousPatterns = [
      /[O0]{3,}/i,  // Too many zeros or O's in a row
      /[1I]{3,}/i,  // Too many ones or I's in a row
      /(.)\1{4,}/i, // Any character repeated more than 4 times
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(vin));
  }

  const validateVinWithNHTSA = async (vin: string): Promise<boolean> => {
    try {
      addLog('Validating VIN with NHTSA API...')
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
      if (!response.ok) {
        addLog('NHTSA API request failed')
        return false
      }

      const data = await response.json()
      const results = data.Results

      if (!Array.isArray(results)) {
        addLog('Invalid response format from NHTSA API')
        return false
      }

      // Check if the VIN decoder found basic vehicle information
      const makeResult = results.find((r: any) => r.Variable === 'Make' && r.Value && r.Value !== 'null')
      const modelResult = results.find((r: any) => r.Variable === 'Model' && r.Value && r.Value !== 'null')
      const yearResult = results.find((r: any) => r.Variable === 'Model Year' && r.Value && r.Value !== 'null')

      const isValid = !!(makeResult && modelResult && yearResult)
      addLog(`NHTSA Validation result: ${isValid ? 'Valid' : 'Invalid'} VIN`)
      
      if (isValid) {
        addLog(`Detected vehicle: ${yearResult.Value} ${makeResult.Value} ${modelResult.Value}`)
      }

      return isValid
    } catch (error) {
      addLog(`NHTSA API error: ${error}`)
      return false
    }
  }

  const preprocessImage = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas.toDataURL()

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Calculate average brightness and contrast
    let totalBrightness = 0
    let minBrightness = 255
    let maxBrightness = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
      totalBrightness += brightness
      minBrightness = Math.min(minBrightness, brightness)
      maxBrightness = Math.max(maxBrightness, brightness)
    }

    const averageBrightness = totalBrightness / (data.length / 4)
    const contrast = maxBrightness - minBrightness

    addLog(`Image analysis - Brightness: ${Math.round(averageBrightness)}, Contrast: ${Math.round(contrast)}`)

    // Determine if we need to invert colors
    const shouldInvert = averageBrightness > 200 && contrast < 100
    if (shouldInvert) {
      addLog('High brightness detected, inverting colors')
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]         // Invert red
        data[i + 1] = 255 - data[i + 1] // Invert green
        data[i + 2] = 255 - data[i + 2] // Invert blue
      }
    }

    // Apply contrast enhancement
    const contrastFactor = 1.2 // Increase contrast by 20%
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const value = data[i + j]
        const normalized = (value / 255 - 0.5) * contrastFactor + 0.5
        data[i + j] = Math.max(0, Math.min(255, Math.round(normalized * 255)))
      }
    }

    // Apply sharpening
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0)
      ctx.filter = 'contrast(120%) brightness(105%)'
      ctx.drawImage(tempCanvas, 0, 0)
    }

    addLog('Image preprocessing completed')
    return canvas.toDataURL()
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      addLog('Video or canvas reference not available')
      return null
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      addLog('Could not get canvas context')
      return null
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      addLog('Video not ready for capture')
      return null
    }

    // Calculate the scanning area (center rectangle)
    const scanAreaWidth = video.videoWidth * (isMobile ? 0.8 : 0.7) // Wider scan area on mobile
    const scanAreaHeight = video.videoHeight * (isMobile ? 0.2 : 0.15) // Taller scan area on mobile
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    // Create a temporary canvas for the cropped area
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = scanAreaWidth
    tempCanvas.height = scanAreaHeight
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      addLog('Could not get temporary canvas context')
      return null
    }

    // Draw only the region of interest to the temporary canvas
    tempCtx.drawImage(
      video,
      startX, startY, scanAreaWidth, scanAreaHeight,
      0, 0, scanAreaWidth, scanAreaHeight
    )

    // Preprocess the image before returning
    return preprocessImage(tempCanvas)
  }

  const startOCRScanning = async (immediateScanning?: boolean) => {
    const shouldScan = immediateScanning ?? isScanning

    if (!streamRef.current || !workerRef.current || !shouldScan) {
      addLog(`Scanning prerequisites not met:`)
      addLog(`- Stream exists: ${!!streamRef.current}`)
      addLog(`- Worker exists: ${!!workerRef.current}`)
      addLog(`- Scanning enabled: ${shouldScan}`)
      return
    }

    try {
      addLog('Attempting to capture frame...')
      const frameData = captureFrame()
      if (!frameData) {
        addLog('No frame data captured, retrying...')
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
        }
        return
      }

      addLog('Frame captured, starting OCR recognition...')
      const { data: { text, confidence } } = await workerRef.current.recognize(frameData)
      addLog(`Detected text: ${text} (confidence: ${confidence}%)`)
      
      if (confidence < 50) {
        addLog('Low confidence detection, skipping...')
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
        }
        return
      }

      // Convert to uppercase and remove non-alphanumeric characters
      const cleanedText = text.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
      
      // Only process if exactly 17 characters
      if (cleanedText.length === 17) {
        if (validateVIN(cleanedText)) {
          addLog('Initial VIN format validation passed')
          
          // Add NHTSA validation
          const isValidVin = await validateVinWithNHTSA(cleanedText)
          
          if (isValidVin) {
            addLog('NHTSA validation passed!')
            onScan(cleanedText)
            toast.success("VIN scanned and validated successfully")
            handleClose()
            return
          } else {
            addLog('Failed NHTSA validation, continuing scan...')
          }
        } else {
          addLog('Failed initial VIN format validation')
        }
      } else {
        addLog(`Invalid length (${cleanedText.length}), expecting 17 characters`)
      }
      
      if (shouldScan) {
        scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
      }
    } catch (error) {
      addLog(`OCR error: ${error}`)
      if (shouldScan) {
        scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
      }
    }
  }

  const handleClose = async () => {
    stopCamera()
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
    setIsDialogOpen(false)
    setLogs([])
  }

  const handleOpen = async () => {
    setIsDialogOpen(true)
    setLogs([])
    await startCamera()
  }

  const handleScanModeChange = async (value: string) => {
    if (value === 'text' || value === 'barcode') {
      setScanMode(value)
      stopCamera()
      setLogs([])
      await startCamera()
    }
  }

  useEffect(() => {
    return () => {
      handleClose()
    }
  }, [])

  useEffect(() => {
    if (streamRef.current) {
      setIsCameraActive(true)
    } else {
      setIsCameraActive(false)
    }
  }, [streamRef.current])

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="icon"
        onClick={handleOpen}
        className="shrink-0"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 space-y-4">
            <DialogTitle>Scan VIN</DialogTitle>
            <DialogDescription>
              <ToggleGroup
                type="single"
                value={scanMode}
                onValueChange={handleScanModeChange}
                className="flex justify-center"
              >
                <ToggleGroupItem value="text" aria-label="Text scanner">
                  <Camera className="h-4 w-4 mr-2" />
                  Text
                </ToggleGroupItem>
                <ToggleGroupItem value="barcode" aria-label="Barcode scanner">
                  <Barcode className="h-4 w-4 mr-2" />
                  Barcode
                </ToggleGroupItem>
              </ToggleGroup>
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              autoPlay
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-cover opacity-0"
            />
            <div className={`absolute inset-x-[${isMobile ? '10%' : '15%'}] top-1/2 -translate-y-1/2 h-[${isMobile ? '20%' : '15%'}] border-2 border-dashed border-primary-foreground/70`}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Position {scanMode === 'text' ? 'VIN text' : 'barcode'} here
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-primary-foreground/70" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Position the {scanMode === 'text' ? 'VIN text' : 'barcode'} within the frame
              </p>
            </div>
          </div>
          <div className="bg-muted p-4 max-h-32 overflow-y-auto text-xs font-mono">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">{log}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
