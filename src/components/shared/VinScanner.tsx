import { Camera, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createWorker, PSM } from 'tesseract.js'
import { BrowserMultiFormatReader } from '@zxing/library'
import { useIsMobile } from "@/hooks/use-mobile"
import { validateVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { preprocessImage } from "@/utils/image-processing"
import { ScannerOverlay } from "./vin-scanner/ScannerOverlay"

interface VinScannerProps {
  onScan: (vin: string) => void
}

interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null)
  const [lastScanDuration, setLastScanDuration] = useState<number | null>(null)
  const isMobile = useIsMobile()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string) => {
    if (!isPaused) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        type: 'vin-scanner'
      }
      
      setLogs(prev => [...prev, message])
      
      const existingLogs = JSON.parse(localStorage.getItem('scanner-logs') || '[]')
      existingLogs.push(logEntry)
      localStorage.setItem('scanner-logs', JSON.stringify(existingLogs.slice(-1000)))
      
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const toggleFlash = async () => {
    if (!streamRef.current) return
    try {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as ExtendedTrackCapabilities
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn } as any]
        })
        setIsFlashOn(!isFlashOn)
        addLog(`Flash ${!isFlashOn ? 'enabled' : 'disabled'}`)
      }
    } catch (err) {
      addLog(`Flash control error: ${err}`)
      toast.error('Failed to toggle flash')
    }
  }

  const correctCommonOcrMistakes = (text: string): string => {
    let corrected = text
      .replace(/[oO]/g, '0')
      .replace(/[iIl|]/g, '1')
      .replace(/[sS]/g, '5')
      .replace(/[zZ]/g, '2')
      .replace(/[bB]/g, '8')
      .replace(/[gG]/g, '6')
      .replace(/[tT]/g, '7')
      .replace(/\s+/g, '')
      .toUpperCase()

    const vinPattern = /[A-HJ-NPR-Z0-9]{17}/
    const match = corrected.match(vinPattern)
    
    addLog(`Raw text detected: ${text}`)
    addLog(`After corrections: ${corrected}`)
    addLog(`VIN Pattern check: ${match ? 'MATCHED' : 'NO MATCH'} - Current text: ${corrected}`)
    addLog(`Expected pattern: 17 characters [A-HJ-NPR-Z0-9] (no I, O, Q)`)
    addLog(`Expected VIN: W1K5J5BB3MN196786`)
    addLog(`Character diff: ${compareVins(corrected, 'W1K5J5BB3MN196786')}`)
    
    return match ? match[0] : corrected
  }

  const compareVins = (detected: string, expected: string): string => {
    if (detected.length !== expected.length) {
      return `Length mismatch: detected=${detected.length}, expected=${expected.length}`
    }

    let diff = ''
    for (let i = 0; i < expected.length; i++) {
      if (detected[i] !== expected[i]) {
        diff += `pos ${i}: ${detected[i]} should be ${expected[i]}; `
      }
    }
    return diff || 'Perfect match!'
  }

  const initializeWorker = async () => {
    try {
      addLog('Initializing OCR worker with enhanced settings...')
      const worker = await createWorker()
      
      await worker.reinitialize('eng')
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: '0',
        tessedit_min_word_length: 17,
        tessjs_create_word_level_boxes: '1',
        tessjs_create_box: '1',
        debug_file: '/dev/null',
        tessjs_mock_parameter: '1'
      })

      addLog('OCR worker initialized with enhanced settings')
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
    setIsFlashOn(false)
  }

  const startCamera = async () => {
    try {
      setScanStartTime(new Date()) // Start timing when camera starts
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }).catch(async () => {
        addLog('Falling back to default camera...')
        return await navigator.mediaDevices.getUserMedia({
          video: true
        })
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        addLog('Stream acquired, initializing camera...')
        
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities() as ExtendedTrackCapabilities
        setHasFlash('torch' in capabilities)
        if ('torch' in capabilities) {
          addLog('Flash capability detected')
        }
        
        const settings = track.getSettings()
        addLog(`Camera: ${settings.facingMode || 'unknown'} facing`)
        
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
            if (!videoRef.current || !barcodeReaderRef.current || isPaused) return;
            
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

  const startOCRScanning = async (immediateScanning?: boolean) => {
    const shouldScan = immediateScanning ?? isScanning

    if (!streamRef.current || !workerRef.current || !shouldScan || isPaused) {
      return
    }

    try {
      const frameData = captureFrame()
      if (!frameData) {
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
        }
        return
      }

      const { data: { text, confidence, words } } = await workerRef.current.recognize(frameData)
      
      addLog(`Raw scan result: ${text}`)
      addLog(`Individual words detected: ${JSON.stringify(words)}`)
      addLog(`Raw confidence: ${confidence}%`)
      
      const correctedText = correctCommonOcrMistakes(text)
      addLog(`After corrections: ${correctedText}`)
      
      const charComparison = text.split('').map((char, i) => {
        return `${char}->${correctedText[i] || ''}`
      }).join(', ')
      addLog(`Character transformations: ${charComparison}`)
      
      if (confidence < 40 || correctedText.length < 15) {
        addLog(`Low quality scan rejected: Confidence ${confidence}%, Length: ${correctedText.length}`)
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
        }
        return
      }

      if (correctedText.length === 17) {
        addLog(`Potential VIN found: ${correctedText}`)
        if (validateVIN(correctedText)) {
          addLog('Local VIN validation passed')
          const isValidVin = await validateVinWithNHTSA(correctedText)
          
          if (isValidVin) {
            const endTime = new Date()
            const duration = scanStartTime ? (endTime.getTime() - scanStartTime.getTime()) / 1000 : 0
            setLastScanDuration(duration)
            
            addLog(`NHTSA validation passed - Valid VIN confirmed in ${duration.toFixed(2)} seconds!`)
            onScan(correctedText)
            toast.success("VIN scanned and validated successfully")
            handleClose()
            return
          } else {
            addLog('NHTSA validation failed - continuing scan...')
          }
        } else {
          addLog(`Local VIN validation failed - Reason: Invalid format`)
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

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      return null
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return null
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const scanAreaWidth = video.videoWidth * 0.95
    const scanAreaHeight = (40 / video.clientHeight) * video.videoHeight
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    addLog(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`)
    addLog(`Scan area: ${Math.round(scanAreaWidth)}x${Math.round(scanAreaHeight)} px`)
    addLog(`Scan position: ${Math.round(startX)},${Math.round(startY)}`)

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = scanAreaWidth
    tempCanvas.height = scanAreaHeight
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      return null
    }

    tempCtx.drawImage(
      video,
      startX, startY, scanAreaWidth, scanAreaHeight,
      0, 0, scanAreaWidth, scanAreaHeight
    )

    const scaledCanvas = document.createElement('canvas')
    scaledCanvas.width = scanAreaWidth * 2
    scaledCanvas.height = scanAreaHeight * 2
    const scaledCtx = scaledCanvas.getContext('2d')
    
    if (scaledCtx) {
      scaledCtx.imageSmoothingEnabled = false
      scaledCtx.drawImage(
        tempCanvas,
        0, 0, tempCanvas.width, tempCanvas.height,
        0, 0, scaledCanvas.width, scaledCanvas.height
      )
    }

    return preprocessImage(scaledCanvas)
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
        <DialogContent className="sm:max-w-md p-0 h-[100dvh] sm:h-auto [&>button]:hidden">
          <ScannerOverlay
            scanMode={scanMode}
            onScanModeChange={handleScanModeChange}
            hasFlash={hasFlash}
            isFlashOn={isFlashOn}
            onFlashToggle={toggleFlash}
            onClose={handleClose}
          />
          <div className="relative h-[calc(100dvh-12rem)] sm:h-auto sm:aspect-video w-full overflow-hidden">
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
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-40">
              <div className="absolute inset-0 border-2 border-primary rounded-lg" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg">
                <p className="text-white text-center text-sm">
                  Position {scanMode === 'text' ? 'VIN text' : 'barcode'} within frame
                </p>
              </div>
            </div>
          </div>
          <div className="bg-muted p-4">
            {lastScanDuration !== null && (
              <div className="mb-2 text-sm font-medium text-primary">
                Last successful scan took: {lastScanDuration.toFixed(2)} seconds
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Scan Logs</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto text-xs font-mono">
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-muted-foreground">{log}</div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
