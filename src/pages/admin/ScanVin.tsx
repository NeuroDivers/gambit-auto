
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VinScanner } from "@/components/shared/VinScanner"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function ScanVin() {
  const navigate = useNavigate()

  const handleVinScanned = (vin: string) => {
    // Store the scanned VIN in localStorage or state management
    localStorage.setItem('scanned-vin', vin)
    toast.success(`VIN scanned successfully: ${vin}`)
    
    // Navigate to create quote with the scanned VIN
    navigate('/estimates/create')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Scan Vehicle VIN</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan VIN
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <p className="text-center text-muted-foreground mb-2">
            Use your camera to scan a vehicle's VIN barcode or text
          </p>
          
          <VinScanner onScan={handleVinScanned} />
          
          <div className="text-sm text-muted-foreground mt-4 max-w-md text-center">
            Position the VIN within the scanning frame. The system will automatically detect and validate the code.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
