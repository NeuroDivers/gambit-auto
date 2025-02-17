
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { QuoteRequest } from "@/types/quote-request"
import { toast } from "sonner"

export function useQuoteRequestManagement() {
  const [estimateAmount, setEstimateAmount] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  
  const queryClient = useQueryClient()

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

      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([urlToRemove])

      if (deleteError) throw deleteError

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

  const submitEstimateMutation = useMutation({
    mutationFn: async ({ id, estimates }: { id: string; estimates: Record<string, string> }) => {
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

  const handleEstimateSubmit = (id: string, estimates: Record<string, string>) => {
    if (!Object.keys(estimates).length) {
      toast.error("Please enter estimates for all services")
      return
    }
    submitEstimateMutation.mutate({ id, estimates })
    setEstimateAmount({})
  }

  return {
    estimateAmount,
    setEstimateAmount,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedQuoteId,
    setSelectedQuoteId,
    handleImageRemove,
    handleEstimateSubmit,
    isSubmittingEstimate: submitEstimateMutation.isPending
  }
}
