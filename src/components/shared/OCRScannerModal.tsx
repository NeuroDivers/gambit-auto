
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
import { createWorker, PSM } from 'tesseract.js'

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
  const workerRef = useRef<any>(null)
  const isScanning = useRef(false)

  const validateVin = (vin: string): boolean => {
    // Basic VIN validation
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
    if (!vinRegex.test(vin)) return false

    // Check manufacturer code (first 3 characters)
    const wmi = vin.substring(0, 3).toUpperCase()
    const validWMIs = ['1HD', '1VW', 'JTD', 'WBA', '2HM', '3FA', '1G1', 'WDD']
    if (!validWMIs.includes(wmi)) return false

    return true
  }

  const handleScanSuccess = (scannedValue: string) => {
    const cleanedValue = scannedValue.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase()
    if (validateVin(cleanedValue)) {
      onScan(cleanedValue)
      toast.success("VIN scanned successfully")
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
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const centerWidth = canvas.width * 0.7
    const centerHeight = canvas.height * 0.3
    const x = (canvas.width - centerWidth) / 2
    const y = (canvas.height - centerHeight) / 2
    
    const imageData = ctx.getImageData(x, y, centerWidth, centerHeight)
    
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = centerWidth
    croppedCanvas.height = centerHeight
    const croppedCtx = croppedCanvas.getContext('2d')
    
    if (!croppedCtx) return null
    
    croppedCtx.putImageData(imageData, 0, 0)
    return croppedCanvas
  }

  const initializeOCR = async () => {
    try {
      setIsInitializing(true)
      const worker = await createWorker()
      
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789',
        tessjs_create_tsv: '0',
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        tessjs_create_box: '0',
        tessedit_pageseg_mode: PSM.SINGLE_LINE, // Using the correct enum value
      })
      
      workerRef.current = worker
      setIsInitializing(false)
      return true
    } catch (error) {
      console.error('Error initializing OCR:', error)
      toast.error("Failed to initialize OCR")
      handleClose()
      return false
    }
  }

  const startScanning = async () => {
    if (!isCameraActive || !workerRef.current || !isScanning.current) return

    try {
      const frameCanvas = captureFrame()
      if (!frameCanvas) {
        if (isScanning.current) {
          setTimeout(() => startScanning(), 500)
        }
        return
      }

      setScanProgress(25) // Start progress
      const { data: { text } } = await workerRef.current.recognize(frameCanvas)
      setScanProgress(75) // Update progress after recognition
      
      console.log('Detected text:', text)
      
      const cleanedText = text.replace(/[^A-HJ-NPR-Z0-9]/gi, '')
      setDetectedText(cleanedText || "No text detected")
      
      if (cleanedText.length > 0) {
        const matches = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi)
        if (matches && matches.length > 0) {
          for (const match of matches) {
            if (validateVin(match)) {
              setScanProgress(100)
              handleScanSuccess(match)
              return
            }
          }
        }
        setScanProgress(Math.min((cleanedText.length / 17) * 100, 90))
      } else {
        setScanProgress(0)
      }
      
      if (isScanning.current) {
        setTimeout(() => startScanning(), 500)
      }
    } catch (error) {
      console.error('OCR error:', error)
      setScanProgress(0)
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
      
      const ocrInitialized = await initializeOCR()
      if (ocrInitialized) {
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
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
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
                  <p className="text-sm">Initializing camera and OCR...</p>
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
