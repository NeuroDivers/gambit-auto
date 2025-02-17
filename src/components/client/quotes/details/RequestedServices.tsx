
import { Badge } from "@/components/ui/badge"
import type { QuoteRequest } from "@/types/quote-request"

type RequestedServicesProps = {
  quoteRequest: QuoteRequest
  getServiceName: (serviceId: string) => string
}

export function RequestedServices({ quoteRequest, getServiceName }: RequestedServicesProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Requested Services</h3>
      <div className="flex flex-wrap gap-2">
        {quoteRequest.service_ids.map((serviceId) => (
          <Badge key={serviceId} variant="secondary">
            {getServiceName(serviceId)}
          </Badge>
        ))}
      </div>
    </div>
  )
}
