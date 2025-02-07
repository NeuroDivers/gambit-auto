import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, Archive } from "lucide-react"
import { toast } from "sonner"
import { QuoteRequestCard } from "@/components/quotes/QuoteRequestCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  service_estimates: Record<string, number> | null
  client_response: "accepted" | "rejected" | null
  service_ids: string[]
  media_urls: string[]
  is_archived: boolean
}

export default function QuoteRequestsManagement() {
  const queryClient = useQueryClient()
  const [estimateAmount, setEstimateAmount] = useState<Record<string, string>>({})

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

  const archiveQuoteMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ is_archived: isArchived })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast.success("Quote request updated successfully")
    },
    onError: (error) => {
      toast.error("Failed to update quote request: " + error.message)
    }
  })

  const submitEstimateMutation = useMutation({
    mutationFn: async ({ id, estimates }: { id: string; estimates: Record<string, string> }) => {
      // Convert string values to numbers and validate
      const validEstimates: Record<string, number> = {}
      let total = 0

      for (const [serviceId, amount] of Object.entries(estimates)) {
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
          throw new Error("Please enter valid amounts for all services")
        }
        validEstimates[serviceId] = numAmount
        total += numAmount
      }

      const { error } = await supabase
        .from("quote_requests")
        .update({ 
          service_estimates: validEstimates,
          estimated_amount: total,
          status: "estimated"
        })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast.success("Estimates submitted successfully")
    },
    onError: (error) => {
      toast.error("Failed to submit estimates: " + error.message)
    }
  })

  const handleImageRemove = async (quoteId: string, urlToRemove: string, currentUrls: string[]) => {
    try {
      const { data: quoteRequest } = await supabase
        .from('quote_requests')
        .select('status')
        .eq('id', quoteId)
        .single()

      if (!quoteRequest || !['pending', 'estimated'].includes(quoteRequest.status)) {
        toast.error('Cannot modify images in the current status')
        return
      }

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
    const requestEstimates = estimateAmount
    if (!Object.keys(requestEstimates).length) {
      toast.error("Please enter estimates for all services")
      return
    }
    submitEstimateMutation.mutate({ id, estimates: requestEstimates })
    setEstimateAmount({})
  }

  const handleArchiveToggle = (id: string, currentArchiveStatus: boolean) => {
    archiveQuoteMutation.mutate({ 
      id, 
      isArchived: !currentArchiveStatus 
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const activeQuotes = quoteRequests?.filter(q => !q.is_archived) || []
  const archivedQuotes = quoteRequests?.filter(q => q.is_archived) || []

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="archived">Archived Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid gap-4">
            {activeQuotes.map((request) => (
              <div key={request.id} className="relative">
                <button
                  onClick={() => handleArchiveToggle(request.id, request.is_archived)}
                  className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full"
                  title="Archive quote request"
                >
                  <Archive className="h-5 w-5" />
                </button>
                <QuoteRequestCard
                  request={request}
                  services={services || []}
                  estimateAmount={estimateAmount}
                  setEstimateAmount={setEstimateAmount}
                  onEstimateSubmit={handleEstimateSubmit}
                  onImageRemove={(url) => handleImageRemove(request.id, url, request.media_urls)}
                />
              </div>
            ))}
            {activeQuotes.length === 0 && (
              <p className="text-center text-muted-foreground">No active quote requests found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="grid gap-4">
            {archivedQuotes.map((request) => (
              <div key={request.id} className="relative">
                <button
                  onClick={() => handleArchiveToggle(request.id, request.is_archived)}
                  className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full"
                  title="Unarchive quote request"
                >
                  <Archive className="h-5 w-5 text-muted-foreground" />
                </button>
                <QuoteRequestCard
                  request={request}
                  services={services || []}
                  estimateAmount={estimateAmount}
                  setEstimateAmount={setEstimateAmount}
                  onEstimateSubmit={handleEstimateSubmit}
                  onImageRemove={(url) => handleImageRemove(request.id, url, request.media_urls)}
                />
              </div>
            ))}
            {archivedQuotes.length === 0 && (
              <p className="text-center text-muted-foreground">No archived quote requests found.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
