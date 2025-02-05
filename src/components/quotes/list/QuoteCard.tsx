import { Quote } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ClipboardList } from "lucide-react"
import { QuoteStatusSelect } from "../QuoteStatusSelect"

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{quote.quote_number}</span>
          <div className="flex items-center gap-4">
            <QuoteStatusSelect 
              status={quote.status} 
              quoteId={quote.id}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onConvertToWorkOrder(quote.id)}
              disabled={quote.status === 'converted'}
              title="Convert to Work Order"
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(quote)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(quote)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Customer: </span>
            {quote.customer_first_name} {quote.customer_last_name}
          </div>
          <div>
            <span className="font-semibold">Vehicle: </span>
            {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
          </div>
          <div>
            <span className="font-semibold">Total: </span>
            ${quote.total.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}