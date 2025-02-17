
import { Badge } from "@/components/ui/badge"
import type { QuoteRequest } from "@/types/quote-request"

interface EstimateDetailsProps {
  request: QuoteRequest
  services: any[]
}

export function EstimateDetails({ request, services }: EstimateDetailsProps) {
  if (!request.service_estimates) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Estimate Details:</h4>
      {Object.entries(request.service_estimates).map(([serviceId, amount]) => {
        const service = services?.find(s => s.id === serviceId)
        return service && (
          <div key={serviceId} className="flex justify-between text-sm">
            <span>{service.name}</span>
            <span className="font-medium">${amount}</span>
          </div>
        )
      })}
      <div className="flex justify-between text-base font-semibold pt-2 border-t">
        <span>Total Estimate:</span>
        <span>${request.estimated_amount}</span>
      </div>
      {request.client_response && (
        <Badge variant={request.client_response === "accepted" ? "outline" : "destructive"}>
          {request.client_response === "accepted" ? "Accepted" : "Rejected"}
        </Badge>
      )}
    </div>
  )
}
