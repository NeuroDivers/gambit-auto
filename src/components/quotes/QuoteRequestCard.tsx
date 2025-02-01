import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { QuoteRequest } from "./types"
import { QuoteCardHeader } from "./card/QuoteCardHeader"
import { QuoteCardDetails } from "./card/QuoteCardDetails"
import { QuoteCardActions } from "./card/QuoteCardActions"

export function QuoteRequestCard({ request }: { request: QuoteRequest }) {
  return (
    <Card className="group transition-all duration-200 hover:shadow-xl bg-gradient-to-br from-card to-card/95 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-4">
        <QuoteCardHeader request={request} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <QuoteCardDetails request={request} />
          {request.additional_notes && (
            <div className="bg-background/40 rounded-lg p-3 mt-3">
              <span className="text-sm text-white/50 block mb-1">Notes</span>
              <p className="text-sm text-white/90">{request.additional_notes}</p>
            </div>
          )}
          <QuoteCardActions request={request} />
        </div>
      </CardContent>
    </Card>
  )
}