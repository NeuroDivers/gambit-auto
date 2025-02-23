
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
import { createWorker } from 'tesseract.js'

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [scanMode, setScanMode] = useState<'barcode' | 'ocr'>('barcode')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const workerRef = useRef<any>(null)
  const isScanning = useRef(false)

  const stopCamera = () => {
    isScanning.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    setIsCameraActive(false)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        await videoRef.current.play()
        
        if (scanMode === 'barcode') {
          // Initialize barcode reader
          const hints = new Map<DecodeHintType, any>();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.CODE_39,
            BarcodeFormat.CODE_128,
            BarcodeFormat.DATA_MATRIX
          ]);
          hints.set(DecodeHintType.TRY_HARDER, true);
          
          readerRef.current = new BrowserMultiFormatReader(hints)
          isScanning.current = true
          startScanning()
        } else {
          // Initialize OCR
          workerRef.current = await createWorker('eng')
          isScanning.current = true
          startOCRScanning()
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Could not access camera. Please check camera permissions.")
      setIsDialogOpen(false)
    }
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    // Match canvas size to video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/png')
  }

  const startOCRScanning = async () => {
    if (!isCameraActive || !workerRef.current || !isScanning.current) return

    try {
      const frameData = captureFrame()
      if (!frameData) {
        if (isScanning.current) {
          requestAnimationFrame(startOCRScanning)
        }
        return
      }

      const { data: { text } } = await workerRef.current.recognize(frameData)
      
      // Look for VIN-like pattern in the recognized text
      const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i)
      
      if (vinMatch) {
        const scannedValue = vinMatch[0]
        if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(scannedValue)) {
          onScan(scannedValue.toUpperCase())
          toast.success("VIN scanned successfully")
          handleClose()
          return
        }
      }
      
      // No valid VIN found, continue scanning
      if (isScanning.current) {
        requestAnimationFrame(startOCRScanning)
      }
    } catch (error) {
      console.error('OCR error:', error)
      if (isScanning.current) {
        requestAnimationFrame(startOCRScanning)
      }
    }
  }

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current || !isCameraActive || !isScanning.current) return

    try {
      const result = await readerRef.current.decodeFromVideoElement(videoRef.current)
      if (result) {
        const scannedValue = result.getText().trim()
        
        // Basic VIN validation (17 characters, alphanumeric)
        if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(scannedValue)) {
          onScan(scannedValue.toUpperCase())
          toast.success("VIN scanned successfully")
          handleClose()
        } else {
          console.log("Invalid VIN format:", scannedValue)
          // Continue scanning if invalid
          if (isScanning.current) {
            requestAnimationFrame(() => startScanning())
          }
        }
      } else {
        // No result found, continue scanning
        if (isScanning.current) {
          requestAnimationFrame(() => startScanning())
        }
      }
    } catch (error) {
      // Error usually means no barcode found, continue scanning
      if (isScanning.current) {
        requestAnimationFrame(() => startScanning())
      }
    }
  }

  const handleClose = async () => {
    isScanning.current = false
    stopCamera()
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
    setIsDialogOpen(false)
  }

  const handleOpen = async () => {
    setIsDialogOpen(true)
    await startCamera()
  }

  const toggleScanMode = async () => {
    isScanning.current = false
    stopCamera()
    setScanMode(prev => prev === 'barcode' ? 'ocr' : 'barcode')
    await startCamera()
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
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 space-y-4">
            <DialogTitle>
              {scanMode === 'barcode' ? 'Scan VIN Barcode' : 'Scan VIN Text'}
            </DialogTitle>
            <Button variant="secondary" onClick={toggleScanMode} className="w-full">
              Switch to {scanMode === 'barcode' ? 'Text Scanner (OCR)' : 'Barcode Scanner'}
            </Button>
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
            <div className="absolute inset-0 border-2 border-primary opacity-50" />
            {/* Scanning guide overlay */}
            <div className="absolute inset-[15%] border-2 border-dashed border-primary-foreground/70">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Position VIN {scanMode === 'barcode' ? 'barcode' : 'text'} here
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-primary-foreground/70" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Position the VIN {scanMode === 'barcode' ? 'barcode' : 'text'} within the frame
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
