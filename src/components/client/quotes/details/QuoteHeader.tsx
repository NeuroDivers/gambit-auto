
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Estimate Request Details</h2>
      </div>
      <Badge variant={statusVariant[quoteRequest.status as keyof typeof statusVariant]}>
        {quoteRequest.status}
      </Badge>
    </div>
  )
}
