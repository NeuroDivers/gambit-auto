
import { X, Flashlight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScannerOverlayProps {
  onFlashToggle: () => void
  onClose: () => void
  hasFlash: boolean
  isFlashOn: boolean
}

export function ScannerOverlay({
  onFlashToggle,
  onClose,
  hasFlash,
  isFlashOn,
}: ScannerOverlayProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-background/80 p-2 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      {hasFlash && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFlashToggle}
          data-active={isFlashOn}
          className="data-[active=true]:text-yellow-500"
        >
          <Flashlight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
