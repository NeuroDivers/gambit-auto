
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
    const cleanedValue = scannedValue.replace(/[^A-HJ-NPR-Z0-9]/gi, '')
    if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(cleanedValue)) {
      onScan(cleanedValue.toUpperCase())
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
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get the center portion of the image for better OCR
    const centerWidth = canvas.width * 0.7
    const centerHeight = canvas.height * 0.3
    const x = (canvas.width - centerWidth) / 2
    const y = (canvas.height - centerHeight) / 2
    
    // Draw a white background for better contrast
    ctx.fillStyle = 'white'
    ctx.fillRect(x, y, centerWidth, centerHeight)
    
    // Draw the cropped video frame
    ctx.drawImage(
      video,
      x, y, centerWidth, centerHeight,  // source rectangle
      x, y, centerWidth, centerHeight   // destination rectangle
    )
    
    return canvas.toDataURL('image/png', 1.0)
  }

  const initializeWorker = async () => {
    try {
      await cleanupWorker()
      setIsInitializing(true)
      
      workerRef.current = await createWorker({
        logger: m => console.log('Tesseract:', m),
        errorHandler: err => console.error('Tesseract error:', err)
      })
      
      await workerRef.current.loadLanguage('eng')
      await workerRef.current.initialize('eng')
      await workerRef.current.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789',
      })
      
      setIsInitializing(false)
      return true
    } catch (error) {
      console.error('Error initializing Tesseract worker:', error)
      toast.error("Failed to initialize text recognition")
      handleClose()
      return false
    }
  }

  const startOCRScanning = async () => {
    if (!isCameraActive || !workerRef.current || !isScanning.current) return

    try {
      const frameData = captureFrame()
      if (!frameData) {
        if (isScanning.current) {
          requestAnimationFrame(() => startOCRScanning())
        }
        return
      }

      const { data: { text } } = await workerRef.current.recognize(frameData)
      console.log('OCR detected text:', text)
      
      // Clean up the text and look for VIN patterns
      const cleanedText = text.replace(/[^A-HJ-NPR-Z0-9]/gi, '')
      const matches = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi)
      
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(match)) {
            handleScanSuccess(match)
            return
          }
        }
      }
      
      if (isScanning.current) {
        requestAnimationFrame(() => startOCRScanning())
      }
    } catch (error) {
      console.error('OCR error:', error)
      if (isScanning.current) {
        requestAnimationFrame(() => startOCRScanning())
      }
    }
  }

  const startCamera = async () => {
    try {
      setIsInitializing(true)
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (!videoRef.current) return
      
      videoRef.current.srcObject = stream
      streamRef.current = stream
      
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject(new Error('Video element not found'))
        
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
      
      const workerInitialized = await initializeWorker()
      if (workerInitialized) {
        isScanning.current = true
        startOCRScanning()
      }
      
      setIsInitializing(false)
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
          <div className="relative aspect-video w-full overflow-hidden bg-black">
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
            <div className="absolute inset-[15%] border-2 border-dashed border-primary">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Center VIN text here
              </div>
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
