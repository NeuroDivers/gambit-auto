
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
        <div className="relative w-[90%] aspect-[4.5/1] max-w-3xl">
          {/* Corner markers - made bigger */}
          <div className="absolute -left-3 -top-3 w-6 h-6 border-l-2 border-t-2 border-primary"></div>
          <div className="absolute -right-3 -top-3 w-6 h-6 border-r-2 border-t-2 border-primary"></div>
          <div className="absolute -left-3 -bottom-3 w-6 h-6 border-l-2 border-b-2 border-primary"></div>
          <div className="absolute -right-3 -bottom-3 w-6 h-6 border-r-2 border-b-2 border-primary"></div>
          
          {/* Center guide - made bigger */}
          <div className="absolute inset-0 border-2 border-dashed border-primary/70">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-primary/70"></div>
          </div>
          
          {/* Helper text */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
            Position {scanMode === 'text' ? 'VIN text' : 'barcode'} within frame
          </div>
        </div>
      </div>
    </>
  )
}
