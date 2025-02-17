
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, Upload, X } from "lucide-react"
import { useState } from "react"
import { ImageGallery } from "@/components/client/quotes/ImageGallery"
import { EstimateForm } from "./EstimateForm"
import type { QuoteRequest } from "@/types/quote-request"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface QuoteRequestCardProps {
  request: QuoteRequest
  services: any[]
  estimateAmount: Record<string, string>
  setEstimateAmount: (value: Record<string, string>) => void
  onEstimateSubmit: (id: string, estimates: Record<string, string>) => void
  onImageRemove: (url: string, quoteId: string, currentUrls: string[]) => void
  onStatusChange: (id: string, status: QuoteRequest['status']) => void
  onDelete: (id: string) => void
  isSubmitting?: boolean
}

export function QuoteRequestCard({
  request,
  services,
  estimateAmount,
  setEstimateAmount,
  onEstimateSubmit,
  onImageRemove,
  onStatusChange,
  onDelete,
  isSubmitting = false
}: QuoteRequestCardProps) {
  const [uploadKey, setUploadKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return
      
      setIsUploading(true)
      const files = Array.from(event.target.files)
      const currentUrls = request.media_urls || []
      const newUrls: string[] = []

      // Upload each file
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${request.id}-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(fileName)

        if (publicUrlData?.publicUrl) {
          newUrls.push(publicUrlData.publicUrl)
        }
      }

      // Update quote request with new URLs
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ 
          media_urls: [...currentUrls, ...newUrls]
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setIsUploading(false)
      setUploadKey(prev => prev + 1)
    }
  }

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
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

          {/* Description if available */}
          {request.description && (
            <div>
              <h4 className="text-sm font-medium">Additional Details:</h4>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </div>
          )}

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Images</h4>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <input
                    key={uploadKey}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Add Images"}
                </label>
              </Button>
            </div>
            {request.media_urls && request.media_urls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {request.media_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="rounded-md object-cover w-full aspect-video"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onImageRemove(request.id, url, request.media_urls || [])}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images uploaded</p>
            )}
          </div>

          {/* Estimate Form for pending requests */}
          {request.status === "pending" && (
            <EstimateForm
              quoteRequest={request}
              services={services}
              onSubmit={(estimates) => onEstimateSubmit(request.id, estimates)}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Show estimate details if already estimated */}
          {request.status === "estimated" && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Estimate Details:</h4>
              {Object.entries(request.service_estimates || {}).map(([serviceId, amount]) => {
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
