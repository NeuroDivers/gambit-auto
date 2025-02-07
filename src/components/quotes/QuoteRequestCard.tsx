import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageGallery } from "@/components/client/quotes/ImageGallery"
import { getServiceNames, getStatusBadgeVariant } from "./utils"
import { Trash2 } from "lucide-react"

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
  service_estimates: Record<string, number> | null
  client_response: "accepted" | "rejected" | null
  service_ids: string[]
  media_urls: string[]
  is_archived: boolean
}

type ServiceEstimates = { [key: string]: string }

type QuoteRequestCardProps = {
  request: QuoteRequest
  services: any[]
  estimateAmount: ServiceEstimates
  setEstimateAmount: (value: ServiceEstimates) => void
  onEstimateSubmit: (id: string) => void
  onImageRemove?: (url: string) => void
  onStatusChange?: (id: string, status: QuoteRequest['status']) => void
  onDelete?: (id: string) => void
}

export function QuoteRequestCard({ 
  request, 
  services, 
  estimateAmount, 
  setEstimateAmount, 
  onEstimateSubmit,
  onImageRemove,
  onStatusChange,
  onDelete
}: QuoteRequestCardProps) {
  const totalEstimate = request.service_estimates 
    ? Object.values(request.service_estimates).reduce((sum, amount) => sum + amount, 0)
    : null

  return (
    <Card className={cn(
      "transition-colors",
      request.status === "accepted" && !request.client_response && "border-primary"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
        </CardTitle>
        <div className="flex items-center gap-2">
          {onStatusChange ? (
            <Select
              value={request.status}
              onValueChange={(value) => onStatusChange(request.id, value as QuoteRequest['status'])}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="estimated">Estimated</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={getStatusBadgeVariant(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(request.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
            onImageRemove={onImageRemove || (() => {})}
          />
        )}
        
        {totalEstimate !== null && (
          <div className="mt-2">
            <h4 className="text-sm font-semibold mb-1">Service Estimates (before taxes):</h4>
            {Object.entries(request.service_estimates || {}).map(([serviceId, amount]) => (
              <p key={serviceId} className="text-sm">
                {services?.find(s => s.id === serviceId)?.name}: ${amount.toFixed(2)}
              </p>
            ))}
            <p className="mt-2 text-lg font-semibold">
              Total Estimate: ${totalEstimate.toFixed(2)}
            </p>
          </div>
        )}

        {request.status === "pending" && (
          <div className="space-y-4 mt-4">
            <h4 className="text-sm font-semibold">Enter Service Estimates:</h4>
            {request.service_ids.map((serviceId) => {
              const service = services?.find(s => s.id === serviceId)
              return (
                <div key={serviceId} className="flex gap-2 items-center">
                  <span className="text-sm min-w-[150px]">{service?.name}:</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={estimateAmount[serviceId] || ""}
                    onChange={(e) => {
                      setEstimateAmount({
                        ...estimateAmount,
                        [serviceId]: e.target.value
                      });
                    }}
                    className="max-w-[200px]"
                  />
                </div>
              )
            })}
            <Button 
              variant="default"
              onClick={() => onEstimateSubmit(request.id)}
              className="mt-2"
            >
              Submit Estimates
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
