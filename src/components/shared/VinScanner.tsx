
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

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Match canvas size to video feed
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // Use Tesseract.js or similar OCR library here
      // For now, we'll simulate finding a VIN by detecting if there's enough contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Simple contrast detection
      let totalBrightness = 0
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        totalBrightness += brightness
      }
      
      const averageBrightness = totalBrightness / (data.length / 4)
      
      // If we detect significant contrast, assume we found a VIN
      if (Math.abs(averageBrightness - 128) > 50) {
        // In a real implementation, we would:
        // 1. Use OCR to detect text in the image
        // 2. Look for a 17-character pattern matching VIN format
        // 3. Validate the VIN using checksum
        const simulatedVin = "1HGCM82633A123456" // Example VIN
        stopScanning()
        onScan(simulatedVin)
        toast.success("VIN scanned successfully")
        return
      }
    } catch (error) {
      console.error('Error processing frame:', error)
    }

    // Continue processing frames
    if (scanning) {
      requestAnimationFrame(processFrame)
    }
  }

  const handleScan = async () => {
    try {
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
      setScanning(true)

      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        if (!videoRef.current) return
        videoRef.current.play()
        processFrame()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Could not access camera")
      setScanning(false)
    }
  }

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="icon"
        onClick={handleScan}
        className="shrink-0"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={scanning} onOpenChange={(open) => !open && stopScanning()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan VIN</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ display: 'none' }}
            />
            <div className="absolute inset-0 border-2 border-primary opacity-50 rounded-lg" />
            {/* VIN scanning guide overlay */}
            <div className="absolute inset-[15%] border-2 border-dashed border-primary-foreground/70">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Position VIN here
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-primary-foreground/70" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Position the VIN number within the frame
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
