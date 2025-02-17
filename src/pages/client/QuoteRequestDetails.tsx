
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageGallery } from "@/components/client/quotes/ImageGallery"
import { useQuoteRequestActions } from "@/hooks/useQuoteRequestActions"
import { ArrowLeft, Upload } from "lucide-react"
import { toast } from "sonner"

export default function QuoteRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const { handleResponseMutation } = useQuoteRequestActions()

  const { data: quoteRequest, isLoading } = useQuery({
    queryKey: ["quoteRequest", id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          client:clients(*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    }
  })

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
      if (error) throw error
      return data
    }
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return

      setUploading(true)
      const files = Array.from(event.target.files)
      const currentUrls = quoteRequest?.media_urls || []
      const newUrls: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError
        newUrls.push(filePath)
      }

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ media_urls: [...currentUrls, ...newUrls] })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (urlToRemove: string) => {
    try {
      const currentUrls = quoteRequest?.media_urls || []
      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([urlToRemove])

      if (deleteError) throw deleteError

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: currentUrls.filter(url => url !== urlToRemove)
        })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success('Image removed successfully')
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!quoteRequest) {
    return <div>Quote request not found</div>
  }

  const getServiceName = (serviceId: string) => {
    return services?.find(s => s.id === serviceId)?.name || "Unknown Service"
  }

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/client/quotes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quote Requests
        </Button>
        <Badge variant={statusVariant[quoteRequest.status as keyof typeof statusVariant]}>
          {quoteRequest.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Make:</span>
                <span className="ml-2">{quoteRequest.vehicle_make}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Model:</span>
                <span className="ml-2">{quoteRequest.vehicle_model}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Year:</span>
                <span className="ml-2">{quoteRequest.vehicle_year}</span>
              </div>
              <div>
                <span className="text-muted-foreground">VIN:</span>
                <span className="ml-2">{quoteRequest.vehicle_vin}</span>
              </div>
            </div>
          </div>

          {/* Services */}
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

          {/* Description */}
          {quoteRequest.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <p className="text-muted-foreground">{quoteRequest.description}</p>
            </div>
          )}

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Images</h3>
              {["pending", "estimated"].includes(quoteRequest.status) && (
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </Button>
              )}
            </div>
            {quoteRequest.media_urls && quoteRequest.media_urls.length > 0 ? (
              <ImageGallery
                mediaUrls={quoteRequest.media_urls}
                status={quoteRequest.status}
                onImageRemove={handleImageRemove}
              />
            ) : (
              <p className="text-muted-foreground">No images uploaded</p>
            )}
          </div>

          {/* Estimate Information */}
          {quoteRequest.status === "estimated" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Estimate Details</h3>
              {Object.entries(quoteRequest.service_estimates || {}).map(([serviceId, amount]) => (
                <div key={serviceId} className="flex justify-between items-center">
                  <span>{getServiceName(serviceId)}</span>
                  <span className="font-medium">${amount}</span>
                </div>
              ))}
              <div className="mt-4 flex justify-between items-center text-lg font-semibold">
                <span>Total Estimate:</span>
                <span>${quoteRequest.estimated_amount}</span>
              </div>
              {!quoteRequest.client_response && (
                <div className="mt-4 flex gap-4 justify-end">
                  <Button
                    onClick={() => handleResponseMutation.mutate({ id: quoteRequest.id, response: "accepted" })}
                  >
                    Accept Quote
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleResponseMutation.mutate({ id: quoteRequest.id, response: "rejected" })}
                  >
                    Decline Quote
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
