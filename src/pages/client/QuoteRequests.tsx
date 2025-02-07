
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { QuoteRequestCard } from "@/components/client/quotes/QuoteRequestCard"

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
          <QuoteRequestCard
            key={request.id}
            request={request}
            services={services || []}
            onAcceptEstimate={(id) => handleResponseMutation.mutate({ id, response: "accepted" })}
            onRejectEstimate={(id) => handleResponseMutation.mutate({ id, response: "rejected" })}
            onUploadImages={handleImageUpload}
            uploading={uploading}
            onImageRemove={handleImageRemove}
          />
        ))}
        {quoteRequests?.length === 0 && (
          <p className="text-center text-muted-foreground">No quote requests found.</p>
        )}
      </div>
    </div>
  )
}
