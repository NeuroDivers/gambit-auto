
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useScanner } from "./vin-scanner/hooks/useScanner"
import { ScanOverlay } from "./vin-scanner/components/ScanOverlay"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const handleClose = () => setIsDialogOpen(false)
  
  const {
    scanMode,
    videoRef,
    canvasRef,
    startCamera,
    toggleScanMode
  } = useScanner({
    onScan,
    onClose: handleClose
  })

  const handleOpen = async () => {
    setIsDialogOpen(true)
    await startCamera()
  }

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
            <DialogDescription>
              Position the VIN {scanMode === 'barcode' ? 'barcode' : 'text'} within the frame and hold steady
            </DialogDescription>
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
            <ScanOverlay scanMode={scanMode} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
