
import { Camera, X, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScannerOverlayProps {
  hasFlash?: boolean
  isFlashOn?: boolean
  isPaused?: boolean
  onFlashToggle?: () => void
  onPauseToggle?: () => void
  onClose: () => void
}

export function ScannerOverlay({ 
  hasFlash,
  isFlashOn,
  isPaused,
  onFlashToggle,
  onPauseToggle,
  onClose
}: ScannerOverlayProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-2">
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onPauseToggle}
          className={isPaused ? "text-blue-500" : ""}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="sr-only">
            {isPaused ? 'Resume scanning' : 'Pause scanning'}
          </span>
        </Button>
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
