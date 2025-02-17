
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"

type QuoteHeaderProps = {
  quoteRequest: QuoteRequest
  onBack: () => void
}

export function QuoteHeader({ quoteRequest, onBack }: QuoteHeaderProps) {
  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quote Requests
      </Button>
      <Badge variant={statusVariant[quoteRequest.status as keyof typeof statusVariant]}>
        {quoteRequest.status}
      </Badge>
    </div>
  )
}
