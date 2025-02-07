
import { Loader2 } from "lucide-react"
import { QuoteRequestCard } from "./QuoteRequestCard"
import type { QuoteRequest } from "@/hooks/useQuoteRequestActions"

type QuoteRequestListProps = {
  quoteRequests: QuoteRequest[] | undefined
  services: any[] | undefined
  isLoading: boolean
  onAcceptEstimate: (id: string) => void
  onRejectEstimate: (id: string) => void
  onUploadImages: (event: React.ChangeEvent<HTMLInputElement>, quoteId: string, currentUrls: string[]) => void
  uploading: boolean
  onImageRemove: (quoteId: string, urlToRemove: string, currentUrls: string[]) => void
}

export function QuoteRequestList({
  quoteRequests,
  services,
  isLoading,
  onAcceptEstimate,
  onRejectEstimate,
  onUploadImages,
  uploading,
  onImageRemove
}: QuoteRequestListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {quoteRequests?.map((request) => (
        <QuoteRequestCard
          key={request.id}
          request={request}
          services={services || []}
          onAcceptEstimate={onAcceptEstimate}
          onRejectEstimate={onRejectEstimate}
          onUploadImages={onUploadImages}
          uploading={uploading}
          onImageRemove={onImageRemove}
        />
      ))}
      {quoteRequests?.length === 0 && (
        <p className="text-center text-muted-foreground">No quote requests found.</p>
      )}
    </div>
  )
}

