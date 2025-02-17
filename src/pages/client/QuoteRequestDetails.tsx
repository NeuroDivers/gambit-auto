
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuoteRequestActions } from "@/hooks/useQuoteRequestActions"
import { toast } from "sonner"
import { QuoteHeader } from "@/components/client/quotes/details/QuoteHeader"
import { VehicleInformation } from "@/components/client/quotes/details/VehicleInformation"
import { RequestedServices } from "@/components/client/quotes/details/RequestedServices"
import { MediaSection } from "@/components/client/quotes/details/MediaSection"
import { EstimateDetails } from "@/components/client/quotes/details/EstimateDetails"
import { Button } from "@/components/ui/button"

export default function QuoteRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { handleResponseMutation } = useQuoteRequestActions()

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

  const { data: quoteRequest, isLoading, refetch } = useQuery({
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

      // Save the updated media URLs to the quote request
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ media_urls: [...currentUrls, ...newUrls] })
        .eq('id', id)

      if (updateError) throw updateError

      await refetch()
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

      // Update the quote request with the new media URLs array
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: currentUrls.filter(url => url !== urlToRemove)
        })
        .eq('id', id)

      if (updateError) throw updateError

      await refetch()
      toast.success('Image removed successfully')
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('quote_requests')
        .update({
          media_urls: quoteRequest?.media_urls || []
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Changes saved successfully')
      navigate("/client/quotes") // Navigate back to quotes page after successful save
    } catch (error: any) {
      toast.error('Error saving changes: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const getServiceName = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId)
    return service ? service.name : "Unknown Service"
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!quoteRequest) {
    return <div>Quote request not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <QuoteHeader 
          quoteRequest={quoteRequest}
          onBack={() => navigate("/client/quotes")}
        />
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <VehicleInformation quoteRequest={quoteRequest} />
          
          <RequestedServices 
            quoteRequest={quoteRequest}
            getServiceName={getServiceName}
          />

          {quoteRequest.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <p className="text-muted-foreground">{quoteRequest.description}</p>
            </div>
          )}

          <MediaSection
            quoteRequest={quoteRequest}
            onFileUpload={handleFileUpload}
            onImageRemove={handleImageRemove}
            uploading={uploading}
          />

          <EstimateDetails
            quoteRequest={quoteRequest}
            getServiceName={getServiceName}
            onAcceptEstimate={() => handleResponseMutation.mutate({ 
              id: quoteRequest.id, 
              response: "accepted" 
            })}
            onRejectEstimate={() => handleResponseMutation.mutate({ 
              id: quoteRequest.id, 
              response: "rejected" 
            })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
