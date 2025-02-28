
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  // This is a non-functional placeholder since we're removing this feature
  // It's just here to satisfy the imports and prevent build errors
  return (
    <Button 
      variant="outline" 
      size="icon" 
      type="button" 
      onClick={() => {
        console.warn("VIN scanning functionality has been removed")
      }}
    >
      <Camera className="h-4 w-4" />
    </Button>
  )
}
