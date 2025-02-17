
import { useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

export default function QuoteDetails() {
  const { id } = useParams()
  const [uploading, setUploading] = useState(false)

  const { data: quoteRequest, isLoading, refetch } = useQuery({
    queryKey: ["quoteRequest", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          client:client_id (
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq("id", id)
        .maybeSingle()

      if (error) throw error
      return data
    },
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
        const { data: { publicUrl } } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(filePath)
          
        newUrls.push(publicUrl)
      }

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ media_urls: [...currentUrls, ...newUrls] })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
      refetch()
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (urlToRemove: string) => {
    try {
      const currentUrls = quoteRequest?.media_urls || []
      const fileName = urlToRemove.split('/').pop()
      
      if (!fileName) return

      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([fileName])

      if (deleteError) throw deleteError

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: currentUrls.filter(url => url !== urlToRemove)
        })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success('Image removed successfully')
      refetch()
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!quoteRequest) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Quote request not found.</p>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="px-6">
        <div className="mb-8">
          <PageBreadcrumbs />
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Quote Request Details</h1>
            <Badge variant={quoteRequest.status === 'pending' ? 'secondary' : 
                          quoteRequest.status === 'estimated' ? 'default' :
                          quoteRequest.status === 'accepted' ? 'outline' :
                          quoteRequest.status === 'rejected' ? 'destructive' : 'outline'}>
              {quoteRequest.status}
            </Badge>
          </div>
        </div>
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Customer Information</h2>
              <div className="space-y-1">
                <p><span className="font-medium">Name:</span> {quoteRequest.client?.first_name} {quoteRequest.client?.last_name}</p>
                <p><span className="font-medium">Email:</span> {quoteRequest.client?.email}</p>
                <p><span className="font-medium">Phone:</span> {quoteRequest.client?.phone_number}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Vehicle Information</h2>
              <div className="space-y-1">
                <p><span className="font-medium">Make:</span> {quoteRequest.vehicle_make}</p>
                <p><span className="font-medium">Model:</span> {quoteRequest.vehicle_model}</p>
                <p><span className="font-medium">Year:</span> {quoteRequest.vehicle_year}</p>
                {quoteRequest.vehicle_vin && (
                  <p><span className="font-medium">VIN:</span> {quoteRequest.vehicle_vin}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Request Details</h2>
              <div className="space-y-1">
                <p><span className="font-medium">Created:</span> {new Date(quoteRequest.created_at).toLocaleDateString()}</p>
                {quoteRequest.estimated_amount && (
                  <p><span className="font-medium">Estimated Amount:</span> ${quoteRequest.estimated_amount.toLocaleString()}</p>
                )}
                {quoteRequest.description && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Description:</p>
                    <p className="text-muted-foreground">{quoteRequest.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Attached Images</h2>
                {["pending", "estimated"].includes(quoteRequest.status) && (
                  <Button variant="outline" className="gap-2" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4" />
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {quoteRequest.media_urls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img 
                        src={url}
                        alt={`Quote request image ${index + 1}`}
                        className="rounded-lg object-cover w-full h-full border border-border"
                      />
                      {["pending", "estimated"].includes(quoteRequest.status) && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleImageRemove(url)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No images uploaded</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
