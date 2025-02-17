
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ImageGallery } from "./ImageGallery"
import { getServiceNames, getStatusBadgeVariant } from "@/components/quotes/utils"
import { Upload } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"

type QuoteRequestCardProps = {
  request: QuoteRequest
  services: any[]
  onAcceptEstimate: (id: string) => void
  onRejectEstimate: (id: string) => void
  onUploadImages: (event: React.ChangeEvent<HTMLInputElement>, quoteId: string, currentUrls: string[]) => void
  uploading: boolean
  onImageRemove: (quoteId: string, urlToRemove: string, currentUrls: string[]) => void
}

export function QuoteRequestCard({
  request,
  services,
  onAcceptEstimate,
  onRejectEstimate,
  onUploadImages,
  uploading,
  onImageRemove
}: QuoteRequestCardProps) {
  const inputId = `image-upload-${request.id}`
  const totalEstimate = request.service_estimates 
    ? Object.values(request.service_estimates).reduce((sum, amount) => sum + amount, 0)
    : null

  return (
    <Card className={cn(
      "transition-colors",
      request.status === "estimated" && !request.client_response && "border-primary"
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
            {getServiceNames(request.service_ids, services || []).map((serviceName, index) => (
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
            onImageRemove={(url) => onImageRemove(request.id, url, request.media_urls || [])}
          />
        )}

        {["pending", "estimated"].includes(request.status) && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="gap-2"
              disabled={uploading}
              onClick={() => document.getElementById(inputId)?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Images"}
            </Button>
            <input
              id={inputId}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => onUploadImages(e, request.id, request.media_urls || [])}
              disabled={uploading}
            />
          </div>
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

        {request.status === "estimated" && !request.client_response && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="default"
              onClick={() => onAcceptEstimate(request.id)}
            >
              Accept Estimate
            </Button>
            <Button 
              variant="destructive"
              onClick={() => onRejectEstimate(request.id)}
            >
              Reject Estimate
            </Button>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          <p>VIN: {request.vehicle_vin}</p>
          <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

