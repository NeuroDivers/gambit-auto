
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { toast } from "sonner"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const navigate = useNavigate()

  const handleOpen = () => {
    // Store the current pathname to return to
    navigate(`/admin/vin-scanner?returnTo=${window.location.pathname}`)
  }

  // Check if there's a scanned VIN in session storage when component mounts or on updates
  useEffect(() => {
    const scannedVin = sessionStorage.getItem('scanned-vin')
    if (scannedVin) {
      console.log('VinScanner: Found scanned VIN in sessionStorage:', scannedVin)
      // Use the scanned VIN and clear storage
      onScan(scannedVin)
      toast.success(`VIN scanned: ${scannedVin}`)
      sessionStorage.removeItem('scanned-vin')
      
      // Also clear the vehicle info if it exists
      sessionStorage.removeItem('scanned-vin-info')
    }
  }, [onScan])

  return (
    <Button 
      type="button" 
      variant="outline" 
      size="icon"
      onClick={handleOpen}
      className="shrink-0"
    >
      <Camera className="h-4 w-4" />
    </Button>
  )
}
