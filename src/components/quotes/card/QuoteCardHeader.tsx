import { Badge } from "@/components/ui/badge"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { EditQuoteDialog } from "../EditQuoteDialog"
import { QuoteStatusSelect } from "./QuoteStatusSelect"
import { format } from "date-fns"
import { QuoteRequest } from "../types"

type QuoteCardHeaderProps = {
  request: QuoteRequest
}

export function QuoteCardHeader({ request }: QuoteCardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <CardTitle className="text-lg flex items-center gap-3">
          <span className="text-white/90 group-hover:text-white transition-colors">
            {request.first_name} {request.last_name}
          </span>
          <Badge variant="outline" className="text-xs font-normal bg-background/50">
            {format(new Date(request.created_at), "MMM d, yyyy")}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm flex items-center gap-2">
          <span className="text-primary/80">{request.vehicle_year}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/80">{request.vehicle_make} {request.vehicle_model}</span>
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <EditQuoteDialog quote={request} />
        <QuoteStatusSelect status={request.status} quoteId={request.id} />
      </div>
    </div>
  )
}