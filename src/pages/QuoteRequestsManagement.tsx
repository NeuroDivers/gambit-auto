
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { QuoteRequestCard } from "@/components/quotes/QuoteRequestCard"

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

export default function QuoteRequestsManagement() {
  const queryClient = useQueryClient()
  const [estimateAmount, setEstimateAmount] = useState<{ [key: string]: string }>({})

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
    queryKey: ["adminQuoteRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  const submitEstimateMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ 
          estimated_amount: amount,
          status: "estimated"
        })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast.success("Estimate submitted successfully")
    },
    onError: (error) => {
      toast.error("Failed to submit estimate: " + error.message)
    }
  })

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

      queryClient.invalidateQueries({ queryKey: ['adminQuoteRequests'] })
      toast.success('Image removed successfully')
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  const handleEstimateSubmit = (id: string) => {
    const amount = parseFloat(estimateAmount[id])
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    submitEstimateMutation.mutate({ id, amount })
    setEstimateAmount(prev => ({ ...prev, [id]: "" }))
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
      <div className="grid gap-4">
        {quoteRequests?.map((request) => (
          <QuoteRequestCard
            key={request.id}
            request={request}
            services={services || []}
            estimateAmount={estimateAmount}
            setEstimateAmount={setEstimateAmount}
            onEstimateSubmit={handleEstimateSubmit}
            onImageRemove={(url) => handleImageRemove(request.id, url, request.media_urls)}
          />
        ))}
        {quoteRequests?.length === 0 && (
          <p className="text-center text-muted-foreground">No quote requests found.</p>
        )}
      </div>
    </div>
  )
}
