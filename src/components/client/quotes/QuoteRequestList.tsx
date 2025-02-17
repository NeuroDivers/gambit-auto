
import { Loader2 } from "lucide-react"
import { QuoteRequestCard } from "./QuoteRequestCard"
import type { QuoteRequest } from "@/types/quote-request"
import { useQueryClient } from "@tanstack/react-query"

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
