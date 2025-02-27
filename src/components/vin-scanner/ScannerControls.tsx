
import { AlignLeft, Barcode } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { ScannerControlsProps } from "./types"

export default function ScannerControls({
  scanMode,
  handleScanModeChange,
  showLogs,
  setShowLogs
}: ScannerControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex w-full sm:w-auto gap-2">
        <Toggle
          pressed={scanMode === 'text'}
          onPressedChange={() => handleScanModeChange('text')}
          className={`flex-1 h-8 ${scanMode === 'text' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border'}`}
        >
          <AlignLeft className="mr-1 h-3 w-3" />
          Text Mode
        </Toggle>
        
        <Toggle
          pressed={scanMode === 'barcode'}
          onPressedChange={() => handleScanModeChange('barcode')}
          className={`flex-1 h-8 ${scanMode === 'barcode' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border'}`}
        >
          <Barcode className="mr-1 h-3 w-3" />
          Barcode Mode
        </Toggle>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowLogs(!showLogs)}
        className="w-full sm:w-auto ml-auto"
      >
        <AlignLeft className="mr-1 h-4 w-4" />
        Logs
      </Button>
    </div>
  )
}
