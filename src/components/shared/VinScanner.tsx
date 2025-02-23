
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      
      // Create video element to show camera feed
      const video = document.createElement('video')
      video.srcObject = stream
      
      // TODO: Implement actual VIN scanning logic here
      // For now, we'll just simulate a scan after 3 seconds
      setScanning(true)
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop())
        setScanning(false)
        // This is where we'd normally process the camera feed to detect the VIN
        // For now, we'll just simulate finding a VIN
        onScan("1HGCM82633A123456")
        toast.success("VIN scanned successfully")
      }, 3000)
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Could not access camera")
      setScanning(false)
    }
  }

  return (
    <Button 
      type="button" 
      variant="outline" 
      size="icon"
      disabled={scanning}
      onClick={handleScan}
      className="shrink-0"
    >
      <Camera className="h-4 w-4" />
    </Button>
  )
}
