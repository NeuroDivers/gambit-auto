
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export type QuoteRequest = {
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

export function useQuoteRequests() {
  const queryClient = useQueryClient()

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteRequest['status'] }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast.success("Status updated successfully")
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message)
    }
  })

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quote_requests")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast.success("Quote request deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete quote request: " + error.message)
    }
  })

  return {
    services,
    quoteRequests,
    isLoading,
    archiveQuoteMutation,
    updateStatusMutation,
    deleteQuoteMutation
  }
}
