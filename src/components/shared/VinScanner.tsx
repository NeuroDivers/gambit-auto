
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useVinScanner } from "./vin-scanner/useVinScanner"
import { ScannerOverlay } from "./vin-scanner/ScannerOverlay"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const {
    isDialogOpen,
    scanMode,
    videoRef,
    canvasRef,
    handleClose,
    handleOpen,
    toggleScanMode
  } = useVinScanner({ onScan })

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
            <ScannerOverlay scanMode={scanMode} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
