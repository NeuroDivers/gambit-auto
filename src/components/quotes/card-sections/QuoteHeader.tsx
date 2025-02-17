
import { Badge } from "@/components/ui/badge"
import type { QuoteRequest } from "@/types/quote-request"

interface QuoteHeaderProps {
  request: QuoteRequest
}

export function QuoteHeader({ request }: QuoteHeaderProps) {
  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="space-y-1">
        <h3 className="font-semibold">
          {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
        </h3>
        <p className="text-sm text-muted-foreground">
          Submitted on {new Date(request.created_at).toLocaleDateString()}
        </p>
      </div>
      <Badge variant={statusVariant[request.status as keyof typeof statusVariant]}>
        {request.status}
      </Badge>
    </div>
  )
}
