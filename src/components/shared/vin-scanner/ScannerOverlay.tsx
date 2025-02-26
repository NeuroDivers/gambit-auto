
import { Camera, Barcode, Lightbulb, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScannerOverlayProps {
  scanMode: 'text' | 'barcode'
  onScanModeChange: (mode: string) => void
  hasFlash?: boolean
  isFlashOn?: boolean
  onFlashToggle?: () => void
  onClose?: () => void
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
    <>
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
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Made the overlay container much larger */}
        <div className="relative w-[95%] h-40 max-w-4xl">
          {/* Larger corner markers with thicker borders */}
          <div className="absolute -left-4 -top-4 w-8 h-8 border-l-4 border-t-4 border-primary"></div>
          <div className="absolute -right-4 -top-4 w-8 h-8 border-r-4 border-t-4 border-primary"></div>
          <div className="absolute -left-4 -bottom-4 w-8 h-8 border-l-4 border-b-4 border-primary"></div>
          <div className="absolute -right-4 -bottom-4 w-8 h-8 border-r-4 border-b-4 border-primary"></div>
          
          {/* Larger center guide with thicker borders */}
          <div className="absolute inset-0 border-4 border-dashed border-primary/70">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-primary/70"></div>
          </div>
          
          {/* Larger helper text with better visibility */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg text-base font-medium whitespace-nowrap">
            Position {scanMode === 'text' ? 'VIN text' : 'barcode'} within frame
          </div>
        </div>
      </div>
    </>
  )
}
