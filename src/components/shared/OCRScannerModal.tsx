
import { FileSearch, Loader2 } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { pipeline, Pipeline } from "@huggingface/transformers"

interface OCRScannerModalProps {
  onScan: (vin: string) => void
}

export function OCRScannerModal({ onScan }: OCRScannerModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [detectedText, setDetectedText] = useState("")
  const [scanProgress, setScanProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognizerRef = useRef<Pipeline | null>(null)
  const isScanning = useRef(false)

  const handleScanSuccess = (scannedValue: string) => {
    const cleanedValue = scannedValue.replace(/[^A-HJ-NPR-Z0-9]/gi, '')
    if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(cleanedValue)) {
      onScan(cleanedValue.toUpperCase())
      toast.success("VIN text scanned successfully")
      handleClose()
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
    setIsCameraActive(false)
    setDetectedText("")
    setScanProgress(0)
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the full frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Calculate dimensions for the center area
    const centerWidth = canvas.width * 0.7
    const centerHeight = canvas.height * 0.3
    const x = (canvas.width - centerWidth) / 2
    const y = (canvas.height - centerHeight) / 2
    
    // Get the image data for just the center portion
    const imageData = ctx.getImageData(x, y, centerWidth, centerHeight)
    
    // Create a new canvas for the cropped area
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = centerWidth
    croppedCanvas.height = centerHeight
    const croppedCtx = croppedCanvas.getContext('2d')
    
    if (!croppedCtx) return null
    
    croppedCtx.putImageData(imageData, 0, 0)
    return croppedCanvas
  }

  const initializeRecognizer = async () => {
    try {
      setIsInitializing(true)
      // Initialize the OCR pipeline with a small and efficient model
      const recognizer = await pipeline(
        'text-detection',
        'Xenova/trocr-small-printed'
      )
      recognizerRef.current = recognizer
      setIsInitializing(false)
      return true
    } catch (error) {
      console.error('Error initializing text recognizer:', error)
      toast.error("Failed to initialize text recognition")
      handleClose()
      return false
    }
  }

  const startScanning = async () => {
    if (!isCameraActive || !recognizerRef.current || !isScanning.current) return

    try {
      const frameCanvas = captureFrame()
      if (!frameCanvas) {
        if (isScanning.current) {
          setTimeout(() => startScanning(), 500)
        }
        return
      }

      const result = await recognizerRef.current(frameCanvas)
      console.log('Detected text:', result)
      
      // The model returns an object with a text property
      const detectedText = result.text || ''
      const cleanedText = detectedText.replace(/[^A-HJ-NPR-Z0-9]/gi, '')
      setDetectedText(cleanedText || "No text detected")
      
      let confidence = 0
      if (cleanedText.length > 0) {
        confidence = Math.min((cleanedText.length / 17) * 100, 100)
        const matches = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi)
        if (matches && matches.length > 0) {
          for (const match of matches) {
            if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(match)) {
              handleScanSuccess(match)
              return
            }
          }
        }
      }
      setScanProgress(confidence)
      
      if (isScanning.current) {
        setTimeout(() => startScanning(), 500)
      }
    } catch (error) {
      console.error('Text recognition error:', error)
      if (isScanning.current) {
        setTimeout(() => startScanning(), 500)
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
          frameRate: { ideal: 30 }
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
      
      const recognizerInitialized = await initializeRecognizer()
      if (recognizerInitialized) {
        isScanning.current = true
        startScanning()
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
            <div 
              className={`absolute inset-[15%] border-2 border-dashed transition-colors duration-200 ${
                scanProgress > 50 ? 'border-green-500' : 'border-primary'
              }`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Center VIN text here
              </div>
            </div>
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-sm">Initializing camera and text recognition...</p>
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 space-y-2">
              <div className="w-full bg-black/30 rounded-lg p-2">
                <div className="flex justify-between items-center text-xs text-white mb-1">
                  <span>Scan Progress</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
              <p className="text-white text-center text-sm">
                {detectedText ? `Detected: ${detectedText}` : 'No text detected'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
