
import { Card } from "@/components/ui/card"
import type { QuoteRequest } from "@/types/quote-request"

type VehicleInformationProps = {
  quoteRequest: QuoteRequest
}

export function VehicleInformation({ quoteRequest }: VehicleInformationProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-muted-foreground">Make:</span>
          <span className="ml-2">{quoteRequest.vehicle_make}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Model:</span>
          <span className="ml-2">{quoteRequest.vehicle_model}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Year:</span>
          <span className="ml-2">{quoteRequest.vehicle_year}</span>
        </div>
        <div>
          <span className="text-muted-foreground">VIN:</span>
          <span className="ml-2">{quoteRequest.vehicle_vin}</span>
        </div>
      </div>
    </div>
  )
}
