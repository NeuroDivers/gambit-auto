
import { QuoteRequest } from "@/types/quote-request"

interface CustomerInfoProps {
  quoteRequest: QuoteRequest
}

export function CustomerInfo({ quoteRequest }: CustomerInfoProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Customer Information</h2>
      <div className="space-y-1">
        <p><span className="font-medium">Name:</span> {quoteRequest.client?.first_name} {quoteRequest.client?.last_name}</p>
        <p><span className="font-medium">Email:</span> {quoteRequest.client?.email}</p>
        <p><span className="font-medium">Phone:</span> {quoteRequest.client?.phone_number}</p>
      </div>
    </div>
  )
}
