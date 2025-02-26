
import { Camera, Barcode } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ScannerOverlayProps {
  scanMode: 'text' | 'barcode'
  onScanModeChange: (value: string) => void
}

export function ScannerOverlay({ scanMode, onScanModeChange }: ScannerOverlayProps) {
  return (
    <DialogHeader className="p-4 space-y-4">
      <DialogTitle>Scan VIN</DialogTitle>
      <DialogDescription>
        <ToggleGroup
          type="single"
          value={scanMode}
          onValueChange={onScanModeChange}
          className="flex justify-center"
        >
          <ToggleGroupItem value="text" aria-label="Text scanner">
            <Camera className="h-4 w-4 mr-2" />
            Text
          </ToggleGroupItem>
          <ToggleGroupItem value="barcode" aria-label="Barcode scanner">
            <Barcode className="h-4 w-4 mr-2" />
            Barcode
          </ToggleGroupItem>
        </ToggleGroup>
      </DialogDescription>
    </DialogHeader>
  )
}
