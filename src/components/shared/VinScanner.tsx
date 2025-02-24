import { Camera, Barcode, Focus } from "lucide-react"
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
import { BrowserMultiFormatReader } from '@zxing/library'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"

interface VinScannerProps {
  onScan: (vin: string) => void
}

interface ScanResult {
  text: string;
  confidence: number;
  timestamp: number;
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [focusDistance, setFocusDistance] = useState(0)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)

  const ocrConfig = {
    tessedit_char_whitelist: '0123456789ABCDEFGHJKLMNPRSTUVWXYZ',
    tessedit_ocr_engine_mode: 1, // Neural net LSTM only
    preserve_interword_spaces: '1',
    textord_heavy_nr: '1',
    textord_min_linesize: '2.5',
  }

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const applyImageProcessing = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas.toDataURL()

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i + 1] = data[i + 2] = avg
    }

    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    const sharpenedData = new Uint8ClampedArray(data.length)
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        let r = 0, g = 0, b = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * canvas.width + (x + kx)) * 4
            const weight = sharpenKernel[(ky + 1) * 3 + (kx + 1)]
            r += data[idx] * weight
            g += data[idx + 1] * weight
            b += data[idx + 2] * weight
          }
        }
        const idx = (y * canvas.width + x) * 4
        sharpenedData[idx] = Math.min(255, Math.max(0, r))
        sharpenedData[idx + 1] = Math.min(255, Math.max(0, g))
        sharpenedData[idx + 2] = Math.min(255, Math.max(0, b))
        sharpenedData[idx + 3] = data[idx + 3]
      }
    }

    const contrast = 1.5
    for (let i = 0; i < sharpenedData.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const pixel = sharpenedData[i + j]
        const newPixel = ((pixel / 255 - 0.5) * contrast + 0.5) * 255
        sharpenedData[i + j] = Math.min(255, Math.max(0, newPixel))
      }
    }

    const processedImageData = new ImageData(sharpenedData, canvas.width, canvas.height)
    ctx.putImageData(processedImageData, 0, 0)

    return canvas.toDataURL()
  }

  const validateScanResults = (results: ScanResult[]): string | null => {
    if (results.length < 3) return null

    const resultGroups = results.reduce((acc, curr) => {
      if (!acc[curr.text]) {
        acc[curr.text] = { count: 0, totalConfidence: 0 }
      }
      acc[curr.text].count++
      acc[curr.text].totalConfidence += curr.confidence
      return acc
    }, {} as Record<string, { count: number; totalConfidence: number }>)

    let bestResult: { text: string; count: number; avgConfidence: number } | null = null
    for (const [text, stats] of Object.entries(resultGroups)) {
      const avgConfidence = stats.totalConfidence / stats.count
      if (stats.count >= 2 && avgConfidence > 70) {
        if (!bestResult || stats.count > bestResult.count || 
            (stats.count === bestResult.count && avgConfidence > bestResult.avgConfidence)) {
          bestResult = { text, count: stats.count, avgConfidence }
        }
      }
    }

    return bestResult?.text || null
  }

  const initializeWorker = async () => {
    try {
      addLog('Initializing OCR worker...')
      const worker = await createWorker()
      await worker.reinitialize('eng')
      await worker.setParameters(ocrConfig)
      addLog('OCR worker initialized with custom parameters')
      return worker
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`)
      throw error
    }
  }

  const handleFocusChange = async (value: number[]) => {
    if (!streamRef.current) return
    setFocusDistance(value[0])

    const videoTrack = streamRef.current.getVideoTracks()[0]
    try {
      await videoTrack.applyConstraints({})
      addLog(`Focus value changed to: ${value[0]}`)
    } catch (error) {
      addLog(`Focus adjustment not supported: ${error}`)
    }
  }

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        addLog('Stream acquired, initializing camera...')
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        addLog('Video stream started')

        const videoTrack = stream.getVideoTracks()[0]
        try {
          const capabilities = videoTrack.getCapabilities?.()
          if (capabilities) {
            const constraints: MediaTrackConstraints = {}
            await videoTrack.applyConstraints(constraints)
            addLog('Applied optimal camera settings')
          }
        } catch (error) {
          addLog('Advanced camera settings not supported')
        }

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

    const scanAreaWidth = video.videoWidth * 0.7
    const scanAreaHeight = video.videoHeight * 0.15
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = scanAreaWidth
    tempCanvas.height = scanAreaHeight
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      addLog('Could not get temporary canvas context')
      return null
    }

    tempCtx.drawImage(
      video,
      startX, startY, scanAreaWidth, scanAreaHeight,
      0, 0, scanAreaWidth, scanAreaHeight
    )

    return applyImageProcessing(tempCanvas)
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
      
      const cleanedText = text.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
      if (cleanedText.length === 17) {
        setScanResults(prev => [
          ...prev.slice(-4),
          { text: cleanedText, confidence, timestamp: Date.now() }
        ])

        const validatedVin = validateScanResults(scanResults)
        if (validatedVin && validateVIN(validatedVin)) {
          addLog('Multiple consistent scans detected')
          
          const isValidVin = await validateVinWithNHTSA(validatedVin)
          
          if (isValidVin) {
            addLog('NHTSA validation passed!')
            onScan(validatedVin)
            toast.success("VIN scanned and validated successfully")
            handleClose()
            return
          } else {
            addLog('Failed NHTSA validation, continuing scan...')
          }
        }
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
            <div className="absolute inset-x-[15%] top-1/2 -translate-y-1/2 h-[15%] border-2 border-dashed border-primary-foreground/70">
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
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Focus className="h-4 w-4" />
                <span className="text-sm font-medium">Focus Control</span>
              </div>
              <Slider
                value={[focusDistance]}
                onValueChange={handleFocusChange}
                max={1}
                step={0.1}
                className="w-full"
              />
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
