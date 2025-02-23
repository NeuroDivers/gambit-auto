
import { FileSearch } from "lucide-react"
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

interface OCRScannerModalProps {
  onScan: (vin: string) => void
}

export function OCRScannerModal({ onScan }: OCRScannerModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const isScanning = useRef(false)

  const handleScanSuccess = (scannedValue: string) => {
    if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(scannedValue)) {
      onScan(scannedValue.toUpperCase())
      toast.success("VIN text scanned successfully")
      handleClose()
    }
  }

  const cleanupWorker = async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate()
      } catch (error) {
        console.error('Error terminating worker:', error)
      }
      workerRef.current = null
    }
  }

  const stopCamera = async () => {
    isScanning.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    await cleanupWorker()
    setIsCameraActive(false)
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Flip horizontally if using front camera
    if (window.matchMedia('(max-width: 768px)').matches) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/png', 1.0)
  }

  const initializeWorker = async () => {
    try {
      await cleanupWorker()
      setIsInitializing(true)
      workerRef.current = await createWorker('eng', 1, {
        logger: m => console.log(m),
        errorHandler: err => console.error('Tesseract error:', err)
      })
      setIsInitializing(false)
    } catch (error) {
      console.error('Error initializing Tesseract worker:', error)
      toast.error("Failed to initialize text recognition")
      handleClose()
    }
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
      console.log('OCR detected text:', text) // Debug log
      
      // Look for VIN patterns in the text
      const vinPattern = /[A-HJ-NPR-Z0-9]{17}/gi
      const matches = text.match(vinPattern)
      
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(match)) {
            handleScanSuccess(match)
            return
          }
        }
      }
      
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

  const startCamera = async () => {
    try {
      setIsInitializing(true)
      
      // Try to get the rear camera first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (!videoRef.current) return

      videoRef.current.srcObject = stream
      streamRef.current = stream

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject()
        
        const timeoutId = setTimeout(() => {
          reject(new Error('Video initialization timeout'))
        }, 10000)

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeoutId)
          resolve()
        }
      })

      await videoRef.current.play()
      setIsCameraActive(true)
      setIsInitializing(false)
      
      // Initialize OCR worker after camera is ready
      await initializeWorker()
      isScanning.current = true
      startOCRScanning()
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Could not access camera. Please check camera permissions and try again.")
      setIsInitializing(false)
      handleClose()
    }
  }

  const handleClose = async () => {
    isScanning.current = false
    await stopCamera()
    setIsDialogOpen(false)
    setIsInitializing(false)
  }

  const handleOpen = async () => {
    setIsDialogOpen(true)
    await startCamera()
  }

  useEffect(() => {
    return () => {
      handleClose()
    }
  }, [])

  useEffect(() => {
    if (!isDialogOpen) {
      handleClose()
    }
  }, [isDialogOpen])

  return (
    <>
      <Button 
        type="button" 
        variant="outline"
        onClick={handleOpen}
        className="w-full sm:w-auto"
      >
        <FileSearch className="mr-2 h-4 w-4" />
        Scan VIN Text
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Scan VIN Text</DialogTitle>
            <DialogDescription>
              Position the VIN text within the frame and hold steady
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
            <div className="absolute inset-0 border-2 border-primary opacity-50" />
            <div className="absolute inset-[15%] border-2 border-dashed border-primary-foreground/70">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Position VIN text here
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-primary-foreground/70" />
            </div>
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-2">
                  <FileSearch className="h-8 w-8 animate-pulse mx-auto" />
                  <p className="text-sm">Initializing camera and OCR...</p>
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Hold the camera steady while scanning
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
