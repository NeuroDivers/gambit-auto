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

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  
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
      addLog('Initializing OCR worker...')
      const worker = await createWorker()
      await worker.reinitialize('eng')
      addLog('OCR worker initialized')
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          aspectRatio: { ideal: 16/9 }
        } 
      })
      
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
      /[O0]{3,}/i, 
      /[1I]{3,}/i, 
      /(.)\1{4,}/i,
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(vin));
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
      const { data: { text, confidence } } = await workerRef.current.recognize(frameData, {
        tessedit_char_whitelist: '0123456789ABCDEFGHJKLMNPRSTUVWXYZ',
        tessedit_pageseg_mode: '7',
        tessedit_ocr_engine_mode: '1',
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        tessedit_do_invert: '0',
        tessedit_image_border: '0',
        textord_heavy_nr: '1',
        textord_min_linesize: '3',
        preserve_interword_spaces: '1',
        tessedit_pageseg_fixed_pitch: '0',
        tessedit_fast_mode: '0',
        tessedit_optimize_enable: '1',
        tessedit_tess_adaption_mode: '3',
        debug_file: '/dev/null'
      })

      const cleanedText = text.replace(/[^A-HJ-NPR-Z0-9]/gi, '')
      addLog(`Raw text detected: ${text}`)
      addLog(`Cleaned text: ${cleanedText}`)
      addLog(`Confidence: ${confidence}%`)
      
      if (confidence >= 60) {
        addLog('High confidence detection found!')
        const potentialVins = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi)
        
        if (potentialVins && potentialVins.length > 0) {
          for (const vin of potentialVins) {
            const upperVin = vin.toUpperCase()
            addLog(`Checking potential VIN: ${upperVin}`)
            
            if (validateVIN(upperVin)) {
              addLog('Valid VIN detected!')
              onScan(upperVin)
              toast.success("VIN scanned successfully")
              handleClose()
              return
            } else {
              addLog('VIN format invalid, continuing scan...')
            }
          }
        } else {
          addLog('No 17-character sequence found in text')
        }
      } else {
        addLog('Low confidence detection, continuing scan...')
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

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/png')
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
            <div className="absolute inset-x-[15%] inset-y-[40%] border-2 border-dashed border-primary-foreground/70">
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
