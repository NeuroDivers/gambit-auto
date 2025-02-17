
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Calendar, Trash2, ClipboardList } from "lucide-react"
import type { Quote } from "../types"
import { useNavigate } from "react-router-dom"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type QuoteCardProps = {
  quote: Quote
  onEdit: (quote: Quote) => void
  onDelete: (quote: Quote) => void
  onConvertToWorkOrder: (quoteId: string) => void
}

export function QuoteCard({ 
  quote, 
  onEdit, 
  onDelete, 
  onConvertToWorkOrder 
}: QuoteCardProps) {
  const navigate = useNavigate()
  const canConvert = quote.status === 'approved'

  const statusVariant = {
    draft: "secondary",
    sent: "default",
    approved: "outline",
    rejected: "destructive",
    converted: "outline"
  } as const

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium truncate">
                {quote.customer_first_name} {quote.customer_last_name}
              </h3>
              <Badge variant={statusVariant[quote.status]}>
                {quote.status}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                ${quote.total.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(quote.created_at).toLocaleDateString()}</span>
            </div>
            
            <p className="text-sm text-muted-foreground truncate">
              {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
            </p>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/quotes/${quote.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConvertToWorkOrder(quote.id)}
                    disabled={!canConvert || quote.status === 'converted'}
                  >
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                </div>
              </HoverCardTrigger>
              {!canConvert && quote.status !== 'converted' && (
                <HoverCardContent className="w-64">
                  <p className="text-sm text-muted-foreground">
                    This quote must be approved before converting to a work order.
                  </p>
                </HoverCardContent>
              )}
            </HoverCard>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(quote)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
