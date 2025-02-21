
import { Loader2 } from "lucide-react"
import { QuoteRequestCard } from "./QuoteRequestCard"
import type { QuoteRequest } from "@/types/quote-request"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

type QuoteRequestListProps = {
  quoteRequests: QuoteRequest[] | undefined
  services: any[] | undefined
  isLoading: boolean
  onAcceptEstimate: (id: string) => void
  onRejectEstimate: (id: string) => void
}

export function QuoteRequestList({
  quoteRequests,
  services,
  isLoading,
  onAcceptEstimate,
  onRejectEstimate,
}: QuoteRequestListProps) {
  const queryClient = useQueryClient()

  // Set up real-time subscription for quote updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'quote_requests'
        },
        (payload) => {
          // Invalidate and refetch quotes when any change occurs
          console.log('Quote request change detected:', payload)
          queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {quoteRequests?.map((request) => (
        <QuoteRequestCard
          key={request.id}
          request={request}
          services={services || []}
          onAcceptEstimate={onAcceptEstimate}
          onRejectEstimate={onRejectEstimate}
          onDelete={() => {
            queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
          }}
        />
      ))}
      {quoteRequests?.length === 0 && (
        <p className="text-center text-muted-foreground">No quote requests found.</p>
      )}
    </div>
  )
}
