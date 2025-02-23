
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Quote } from "@/components/quotes/types"
import type { QuoteRequest } from "@/types/quote-request"

export function useEstimatesData(searchTerm: string, statusFilter: string) {
  const { data: quotes, isLoading: isLoadingQuotes, error: quotesError } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const { data: quoteRequests, isLoading: isLoadingRequests, error: requestsError } = useQuery({
    queryKey: ['quote-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          client:clients (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    }
  })

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = (
      quote.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredRequests = quoteRequests?.filter(request => {
    const matchesSearch = (
      request.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return {
    quotes: filteredQuotes,
    quoteRequests: filteredRequests,
    isLoading: isLoadingQuotes || isLoadingRequests,
    error: quotesError || requestsError
  }
}
