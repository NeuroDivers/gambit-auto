
import { QuoteRequest } from "@/types/quote-request"

interface VehicleInfoProps {
  quoteRequest: QuoteRequest
}

export function VehicleInfo({ quoteRequest }: VehicleInfoProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Vehicle Information</h2>
      <div className="space-y-1">
        <p><span className="font-medium">Make:</span> {quoteRequest.vehicle_make}</p>
        <p><span className="font-medium">Model:</span> {quoteRequest.vehicle_model}</p>
        <p><span className="font-medium">Year:</span> {quoteRequest.vehicle_year}</p>
        {quoteRequest.vehicle_vin && (
          <p><span className="font-medium">VIN:</span> {quoteRequest.vehicle_vin}</p>
        )}
      </div>
    </div>
  )
}
