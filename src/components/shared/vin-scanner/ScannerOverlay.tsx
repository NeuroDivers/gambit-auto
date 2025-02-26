
import { Camera, Barcode, Lightbulb, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScannerOverlayProps {
  scanMode: 'text' | 'barcode'
  onScanModeChange: (mode: string) => void
  hasFlash?: boolean
  isFlashOn?: boolean
  onFlashToggle?: () => void
}

export function ScannerOverlay({ 
  scanMode, 
  onScanModeChange,
  hasFlash,
  isFlashOn,
  onFlashToggle
}: ScannerOverlayProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onScanModeChange(scanMode === 'text' ? 'barcode' : 'text')}
        >
          {scanMode === 'text' ? <Barcode className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        </Button>
        {hasFlash && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFlashToggle}
            className={isFlashOn ? "text-yellow-500" : ""}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
