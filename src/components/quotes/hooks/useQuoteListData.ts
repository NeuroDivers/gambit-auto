
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Quote } from "../types"
import { toast } from "sonner"

export function useQuoteListData() {
  const queryClient = useQueryClient()

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          quote_items (
            id,
            service_id,
            service_name,
            quantity,
            unit_price,
            details
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Quote[]
    }
  })

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Quote deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete quote: " + error.message)
    }
  })

  const convertToWorkOrderMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase.rpc('convert_quote_to_work_order', {
        input_quote_id: quoteId
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Quote converted to work order successfully")
    },
    onError: (error) => {
      toast.error("Failed to convert quote: " + error.message)
    }
  })

  return {
    quotes,
    isLoading,
    deleteQuoteMutation,
    convertToWorkOrderMutation
  }
}
