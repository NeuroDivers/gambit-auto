
import { Camera, Barcode, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"

interface ScannerOverlayProps {
  scanMode: 'text' | 'barcode'
  onScanModeChange: (mode: string) => void
  hasFlash?: boolean
  isFlashOn?: boolean
  onFlashToggle?: () => void
  onClose: () => void
}

export function ScannerOverlay({ 
  scanMode, 
  onScanModeChange,
  hasFlash,
  isFlashOn,
  onFlashToggle,
  onClose
}: ScannerOverlayProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-2">
        <Toggle
          pressed={scanMode === 'barcode'}
          onPressedChange={(pressed) => onScanModeChange(pressed ? 'barcode' : 'text')}
          aria-label="Toggle scan mode"
        >
          {scanMode === 'text' ? <Camera className="h-4 w-4" /> : <Barcode className="h-4 w-4" />}
        </Toggle>
        {hasFlash && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFlashToggle}
            className={isFlashOn ? "text-yellow-500" : ""}
          >
            <span className="sr-only">Toggle flash</span>
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close scanner</span>
      </Button>
    </div>
  )
}
