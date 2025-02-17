
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, Upload, X } from "lucide-react"
import { useState } from "react"
import { QuoteRequestDetailsDialog } from "./QuoteRequestDetailsDialog"
import type { QuoteRequest } from "@/types/quote-request"

interface QuoteRequestCardProps {
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUploadImages(event, request.id, request.media_urls || [])
    setUploadKey(prev => prev + 1) // Reset the input
  }

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <h3 className="font-semibold">
              {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
            </h3>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={statusVariant[request.status as keyof typeof statusVariant]}>
            {request.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Preview of services */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Requested Services:</h4>
              <div className="flex flex-wrap gap-2">
                {request.service_ids.map((serviceId) => {
                  const service = services?.find(s => s.id === serviceId)
                  return service ? (
                    <Badge key={serviceId} variant="outline">
                      {service.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>

              {["pending", "estimated"].includes(request.status) && (
                <>
                  <label className="cursor-pointer">
                    <input
                      key={uploadKey}
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Add Images
                      </span>
                    </Button>
                  </label>
                </>
              )}

              {request.status === "estimated" && !request.client_response && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => onAcceptEstimate(request.id)}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onRejectEstimate(request.id)}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>

            {/* Preview images */}
            {request.media_urls && request.media_urls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {request.media_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="rounded-md object-cover w-full aspect-video"
                    />
                    {["pending", "estimated"].includes(request.status) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onImageRemove(request.id, url, request.media_urls || [])}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <QuoteRequestDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quoteRequest={request}
        services={services}
      />
    </>
  )
}
