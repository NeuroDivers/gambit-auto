
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getImageUrl, getServiceNames, getStatusBadgeVariant } from "./utils"
import { ImageGallery } from "@/components/client/quotes/ImageGallery"

type QuoteRequest = {
  id: string
  status: "pending" | "estimated" | "accepted" | "rejected" | "converted"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  description: string
  created_at: string
  estimated_amount: number | null
  client_response: "accepted" | "rejected" | null
  service_ids: string[]
  media_urls: string[]
}

type QuoteRequestCardProps = {
  request: QuoteRequest
  services: any[]
  estimateAmount: { [key: string]: string }
  setEstimateAmount: (value: { [key: string]: string }) => void
  onEstimateSubmit: (id: string) => void
}

export function QuoteRequestCard({ 
  request, 
  services, 
  estimateAmount, 
  setEstimateAmount, 
  onEstimateSubmit 
}: QuoteRequestCardProps) {
  return (
    <Card className={cn(
      "transition-colors",
      request.status === "accepted" && !request.client_response && "border-primary"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
        </CardTitle>
        <Badge variant={getStatusBadgeVariant(request.status)}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-1">Requested Services:</h4>
          <div className="flex flex-wrap gap-2">
            {getServiceNames(request.service_ids, services).map((serviceName, index) => (
              <Badge key={index} variant="secondary">
                {serviceName}
              </Badge>
            ))}
          </div>
        </div>

        {request.media_urls && request.media_urls.length > 0 && (
          <ImageGallery
            mediaUrls={request.media_urls}
            status={request.status}
            onImageRemove={() => {}} // Admin view doesn't allow image removal
          />
        )}
        
        {request.estimated_amount !== null && (
          <p className="mt-2 text-lg font-semibold">
            Estimated Cost: ${request.estimated_amount.toFixed(2)}
          </p>
        )}

        {request.status === "pending" && (
          <div className="flex gap-2 mt-4">
            <Input
              type="number"
              placeholder="Enter estimate amount"
              value={estimateAmount[request.id] || ""}
              onChange={(e) => {
                setEstimateAmount({
                  ...estimateAmount,
                  [request.id]: e.target.value
                });
              }}
              className="max-w-[200px]"
            />
            <Button 
              variant="default"
              onClick={() => onEstimateSubmit(request.id)}
            >
              Submit Estimate
            </Button>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          <p>VIN: {request.vehicle_vin}</p>
          <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
          {request.client_response && (
            <p className="mt-1">
              Client response: <span className="font-semibold">{request.client_response}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
