
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Pencil, Car, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Quote } from "./types"
import { useAdminStatus } from "@/hooks/useAdminStatus"

interface QuoteMobileListProps {
  quotes: Quote[]
  onRowClick: (id: string, type: 'quote') => void
}

export function QuoteMobileList({ quotes, onRowClick }: QuoteMobileListProps) {
  const { isAdmin } = useAdminStatus()

  if (!quotes.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No quotes found
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Card 
          key={quote.id} 
          className="p-4 space-y-4 cursor-pointer hover:bg-accent/5"
          onClick={() => onRowClick(quote.id, 'quote')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">
                {quote.customer_first_name} {quote.customer_last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{quote.customer_email}</p>
            </div>
            <Badge 
              variant={
                quote.status === 'accepted' ? 'default' : 
                quote.status === 'rejected' ? 'destructive' : 
                'secondary'
              }
            >
              {quote.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Quote #{quote.quote_number}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="h-4 w-4" />
              {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(quote.created_at), 'MMM d, yyyy')}
            </div>

            <div className="text-sm font-medium">
              Total: ${quote.total.toFixed(2)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
