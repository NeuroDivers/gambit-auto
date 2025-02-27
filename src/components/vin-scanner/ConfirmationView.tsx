
import { Info, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationViewProps } from "./types"

export default function ConfirmationView({
  detectedVehicle,
  isLoading,
  vinDetails,
  onTryAgain,
  onConfirm
}: ConfirmationViewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold text-lg mb-1">Scanned VIN</h2>
          <p className="font-mono text-lg">{detectedVehicle?.vin}</p>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-blue-50">
          <CardContent className="pt-6 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-2"></div>
              <p>Loading vehicle information...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {vinDetails && (
            <Card className="bg-blue-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    VIN Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-1">
                  <div className="text-sm"><span className="font-medium">Country:</span> {vinDetails.country}</div>
                  <div className="text-sm"><span className="font-medium">Manufacturer:</span> {vinDetails.manufacturer}</div>
                  <div className="text-sm"><span className="font-medium">Type:</span> {vinDetails.vehicleType}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {detectedVehicle?.make && detectedVehicle?.model && detectedVehicle?.year && (
            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-lg font-semibold">{detectedVehicle.year} {detectedVehicle.make} {detectedVehicle.model}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={onTryAgain}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Scan Again
        </Button>
        <Button 
          onClick={onConfirm}
          className="w-full"
        >
          <Check className="mr-2 h-4 w-4" />
          Use This VIN
        </Button>
      </div>
    </div>
  )
}
