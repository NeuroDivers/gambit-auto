
import { useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { Badge } from "@/components/ui/badge"

export default function QuoteDetails() {
  const { id } = useParams()

  const { data: quoteRequest, isLoading } = useQuery({
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

            {quoteRequest.media_urls && quoteRequest.media_urls.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Attached Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {quoteRequest.media_urls.map((url, index) => (
                    <img 
                      key={index}
                      src={url}
                      alt={`Quote request image ${index + 1}`}
                      className="rounded-lg object-cover w-full aspect-square"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
