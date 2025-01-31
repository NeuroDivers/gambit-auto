import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestCard } from "../QuoteRequestCard"
import { StatusLegend } from "../StatusLegend"
import { LoadingState } from "../LoadingState"
import type { QuoteRequest } from "../types"

export function QuoteRequestsSection() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          quote_request_services (
            service_types (
              name
            )
          )
        `)
        .neq('status', 'completed')
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  const statusCounts = {
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    approved: requests?.filter(r => r.status === 'approved').length || 0,
    rejected: requests?.filter(r => r.status === 'rejected').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Quote Requests</h3>
        <StatusLegend statusCounts={statusCounts} />
        {requests?.map((request) => (
          <QuoteRequestCard key={request.id} request={request} />
        ))}
        {requests?.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No quote requests yet
          </div>
        )}
      </div>
    </section>
  )
}