
import { X, Flashlight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ScannerOverlayProps {
  scanMode: "text" | "barcode"
  onScanModeChange: (mode: string) => void
  hasFlash: boolean
  isFlashOn: boolean
  onFlashToggle: () => void
  onClose: () => void
}

export function ScannerOverlay({
  scanMode,
  onScanModeChange,
  hasFlash,
  isFlashOn,
  onFlashToggle,
  onClose,
}: ScannerOverlayProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-50 p-4 bg-gradient-to-b from-black/60 to-transparent">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4">
          {hasFlash && (
            <Button
              variant="ghost"
              size="icon"
              className={`text-white ${isFlashOn ? 'bg-white/20' : ''}`}
              onClick={onFlashToggle}
            >
              <Flashlight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <DialogTitle className="sr-only">
        VIN Scanner
      </DialogTitle>
      <DialogDescription className="sr-only">
        Position the VIN number within the scanning frame to capture it automatically. The scanner will detect standard 17-character VIN codes.
      </DialogDescription>
    </div>
  )
}
