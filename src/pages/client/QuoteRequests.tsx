
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, Upload, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getImageUrl, getServiceNames, getStatusBadgeVariant } from "@/components/quotes/utils"
import { useNavigate } from "react-router-dom"

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

export default function QuoteRequests() {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        toast.error("Please sign in to view your quotes")
        navigate("/auth")
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
      if (error) throw error
      return data
    },
  })

  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
    retry: false,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching quotes:", error)
        if (error.message === "Not authenticated") {
          navigate("/auth")
        } else {
          toast.error("Failed to load quote requests")
        }
      }
    }
  })

  const handleResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string, response: "accepted" | "rejected" }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ 
          client_response: response,
          status: response === "accepted" ? "accepted" : "rejected"
        })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
      toast.success("Response submitted successfully")
    },
    onError: (error) => {
      toast.error("Failed to submit response: " + error.message)
    }
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, quoteId: string, currentUrls: string[]) => {
    try {
      setUploading(true)
      const files = event.target.files
      if (!files || files.length === 0) return

      const newUrls: string[] = []

      // Upload each file
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${quoteId}-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError
        newUrls.push(filePath)
      }

      // Update quote request with new URLs
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ media_urls: [...currentUrls, ...newUrls] })
        .eq('id', quoteId)

      if (updateError) throw updateError

      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] })
      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (quoteId: string, urlToRemove: string, currentUrls: string[]) => {
    try {
      // Remove file from storage
      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([urlToRemove])

      if (deleteError) throw deleteError

      // Update quote request to remove URL from array
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: currentUrls.filter(url => url !== urlToRemove)
        })
        .eq('id', quoteId)

      if (updateError) throw updateError

      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] })
      toast.success('Image removed successfully')
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Quote Requests</h1>
      <div className="grid gap-4">
        {quoteRequests?.map((request) => (
          <Card key={request.id} className={cn(
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
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Uploaded Images:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {request.media_urls.map((url, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                        <img 
                          src={getImageUrl(url)}
                          alt={`Vehicle image ${index + 1}`}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {["pending", "estimated"].includes(request.status) && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => handleImageRemove(request.id, url, request.media_urls)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {["pending", "estimated"].includes(request.status) && (
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    disabled={uploading}
                    asChild
                  >
                    <label>
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Images"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, request.id, request.media_urls || [])}
                        disabled={uploading}
                      />
                    </label>
                  </Button>
                </div>
              )}
              
              {request.estimated_amount !== null && (
                <p className="mt-2 text-lg font-semibold">
                  Estimated Cost: ${request.estimated_amount.toFixed(2)}
                </p>
              )}

              {request.status === "estimated" && !request.client_response && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="default"
                    onClick={() => handleResponseMutation.mutate({ 
                      id: request.id, 
                      response: "accepted" 
                    })}
                  >
                    Accept Estimate
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleResponseMutation.mutate({ 
                      id: request.id, 
                      response: "rejected" 
                    })}
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
        ))}
        {quoteRequests?.length === 0 && (
          <p className="text-center text-muted-foreground">No quote requests found.</p>
        )}
      </div>
    </div>
  )
}
