
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState } from "react"
import { EstimateForm } from "./EstimateForm"
import type { QuoteRequest } from "@/types/quote-request"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { QuoteHeader } from "./card-sections/QuoteHeader"
import { ServicesList } from "./card-sections/ServicesList"
import { EstimateDetails } from "./card-sections/EstimateDetails"
import { MediaGallery } from "./card-sections/MediaGallery"

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

  return (
    <Card>
      <CardHeader>
        <QuoteHeader request={request} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <ServicesList serviceIds={request.service_ids} services={services} />

          {/* Description if available */}
          {request.description && (
            <div>
              <h4 className="text-sm font-medium">Additional Details:</h4>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </div>
          )}

          <MediaGallery
            request={request}
            onImageUpload={handleImageUpload}
            onImageRemove={onImageRemove}
            isUploading={isUploading}
            uploadKey={uploadKey}
          />

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
            <EstimateDetails request={request} services={services} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
