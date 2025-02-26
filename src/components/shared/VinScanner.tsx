import React from 'react'
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import * as Dialog from "@radix-ui/react-dialog"
import { createWorker, PSM } from 'tesseract.js'
import { BrowserMultiFormatReader } from '@zxing/library'
import { useIsMobile } from "@/hooks/use-mobile"
import { validateVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { preprocessImage } from "@/utils/image-processing"
import { ScannerOverlay } from "./vin-scanner/ScannerOverlay"
import { cn } from "@/lib/utils"

interface VinScannerProps {
  onScan: (vin: string) => void
}

interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[99] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <Dialog.Content 
      ref={ref} 
      className={cn(
        "fixed left-[50%] top-[50%] z-[100] w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )} 
      {...props} 
      onPointerDownOutside={(e) => e.preventDefault()}
    />
  </Dialog.Portal>
))
DialogContent.displayName = "DialogContent"

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const isMobile = useIsMobile()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
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
      .replace(/[iIl]/g, '1')
      .replace(/[sS]/g, '5')
      .replace(/[zZ]/g, '2')
      .replace(/[bB]/g, '8')
      .replace(/[gG]/g, '6')
      .replace(/\s+/g, '')
      .toUpperCase()

    const vinPattern = /[A-HJ-NPR-Z0-9]{17}/
    const match = corrected.match(vinPattern)
    return match ? match[0] : corrected
  }

  const initializeWorker = async () => {
    try {
      addLog('Initializing OCR worker...')
      const worker = await createWorker()
      addLog('Worker created, initializing language...')
      
      await worker.reinitialize('eng')
      addLog('Language initialized, setting parameters...')
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: '0',
        tessjs_create_box: '1',
        tessjs_create_unlock: '1'
      })
      
      addLog('OCR worker fully initialized')
      return worker
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`)
      throw error
    }
  }

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }

      const fallbackConstraints = {
        video: true
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          addLog('Stream acquired with back camera')
        }
      } catch (backCameraError) {
        addLog('Back camera not available, trying alternative camera...')
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          addLog('Stream acquired with fallback camera')
        }
      }
      
      if (videoRef.current) {
        const track = streamRef.current?.getVideoTracks()[0]
        if (track) {
          const capabilities = track.getCapabilities() as ExtendedTrackCapabilities
          setHasFlash('torch' in capabilities)
          if ('torch' in capabilities) {
            addLog('Flash capability detected')
          }
        }
        
        addLog('Waiting for video to be ready...')
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        setIsCameraActive(true)
        addLog('Video stream started successfully')

        if (scanMode === 'text') {
          addLog('Initializing OCR worker...')
          workerRef.current = await initializeWorker()
          addLog('Starting OCR scanning loop...')
          if (isDialogOpen) {
            startOCRScanning()
          } else {
            addLog('Dialog not open, waiting for dialog state to update...')
          }
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

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      addLog('Video or canvas reference not available')
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      addLog('Video not ready or context not available')
      return null
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const scanAreaWidth = video.videoWidth * 0.6
    const scanAreaHeight = video.videoHeight * 0.12
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = scanAreaWidth
    tempCanvas.height = scanAreaHeight
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      addLog('Could not create temporary canvas context')
      return null
    }

    tempCtx.drawImage(
      video,
      startX, startY, scanAreaWidth, scanAreaHeight,
      0, 0, scanAreaWidth, scanAreaHeight
    )

    addLog('Frame captured successfully')
    return preprocessImage(tempCanvas)
  }

  const startOCRScanning = async () => {
    if (isProcessingRef.current) {
      addLog('Already processing a frame, skipping...')
      return
    }

    if (!streamRef.current || !workerRef.current || !isDialogOpen) {
      addLog('Scanning conditions not met:')
      addLog(`- Stream available: ${!!streamRef.current}`)
      addLog(`- Worker available: ${!!workerRef.current}`)
      addLog(`- Dialog open: ${isDialogOpen}`)
      return
    }

    try {
      isProcessingRef.current = true
      const frameData = captureFrame()
      
      if (!frameData) {
        addLog('No valid frame captured, retrying...')
        isProcessingRef.current = false
        if (isDialogOpen) {
          scanningRef.current = requestAnimationFrame(startOCRScanning)
        }
        return
      }

      addLog('Processing frame with OCR...')
      const { data: { text, confidence } } = await workerRef.current.recognize(frameData)
      const correctedText = correctCommonOcrMistakes(text)
      
      if (confidence > 40 && correctedText.length >= 15) {
        addLog(`Detected text: ${correctedText} (confidence: ${confidence}%)`)

        if (correctedText.length === 17 && validateVIN(correctedText)) {
          addLog('Valid VIN format detected, validating with NHTSA...')
          const isValidVin = await validateVinWithNHTSA(correctedText)
          
          if (isValidVin) {
            addLog('VIN validated successfully!')
            onScan(correctedText)
            toast.success("VIN scanned and validated successfully")
            handleClose()
            return
          } else {
            addLog('VIN validation failed')
          }
        }
      }

      isProcessingRef.current = false
      if (isDialogOpen) {
        scanningRef.current = requestAnimationFrame(startOCRScanning)
      }
    } catch (error) {
      addLog(`OCR error: ${error}`)
      isProcessingRef.current = false
      if (isDialogOpen) {
        scanningRef.current = requestAnimationFrame(startOCRScanning)
      }
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
    setIsFlashOn(false)
    isProcessingRef.current = false
    addLog('Camera and scanning stopped')
  }

  const handleClose = async () => {
    stopCamera()
    if (workerRef.current) {
      addLog('Terminating OCR worker...')
      await workerRef.current.terminate()
      workerRef.current = null
    }
    setIsDialogOpen(false)
    setLogs([])
  }

  const handleOpen = () => {
    setIsDialogOpen(true)
    setLogs([])
    setTimeout(startCamera, 0)
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
    if (isDialogOpen && isCameraActive && workerRef.current && scanMode === 'text') {
      startOCRScanning()
    }
  }, [isDialogOpen, isCameraActive])

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

      <Dialog.Root open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="p-0">
          <ScannerOverlay
            scanMode={scanMode}
            onScanModeChange={handleScanModeChange}
            hasFlash={hasFlash}
            isFlashOn={isFlashOn}
            onFlashToggle={toggleFlash}
            onClose={handleClose}
          />
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
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 sm:w-1/2 h-[12%] border-2 border-dashed border-primary-foreground/70">
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
      </Dialog.Root>
    </>
  )
}
