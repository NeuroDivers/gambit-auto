
import { Button } from "@/components/ui/button"
import type { QuoteRequest } from "@/types/quote-request"

type EstimateDetailsProps = {
  quoteRequest: QuoteRequest
  getServiceName: (serviceId: string) => string
  onAcceptEstimate: () => void
  onRejectEstimate: () => void
}

export function EstimateDetails({ 
  quoteRequest, 
  getServiceName, 
  onAcceptEstimate, 
  onRejectEstimate 
}: EstimateDetailsProps) {
  if (quoteRequest.status !== "estimated") {
    return null
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Estimate Details</h3>
      {Object.entries(quoteRequest.service_estimates || {}).map(([serviceId, amount]) => (
        <div key={serviceId} className="flex justify-between items-center">
          <span>{getServiceName(serviceId)}</span>
          <span className="font-medium">${String(amount)}</span>
        </div>
      ))}
      <div className="mt-4 flex justify-between items-center text-lg font-semibold">
        <span>Total Estimate:</span>
        <span>${quoteRequest.estimated_amount}</span>
      </div>
      {!quoteRequest.client_response && (
        <div className="mt-4 flex gap-4 justify-end">
          <Button onClick={onAcceptEstimate}>
            Accept Quote
          </Button>
          <Button
            variant="destructive"
            onClick={onRejectEstimate}
          >
            Decline Quote
          </Button>
        </div>
      )}
    </div>
  )
}
