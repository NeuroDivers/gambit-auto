
```typescript
import { formatDistanceToNow } from "date-fns"
import { Invoice } from "../types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Printer, PencilIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

type InvoiceListItemProps = {
  invoice: Invoice
  onEdit?: (invoice: Invoice) => void
}

export function InvoiceListItem({ invoice, onEdit }: InvoiceListItemProps) {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'sent':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'paid':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'overdue':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
  }

  return (
    <Card className="p-6 hover:border-primary/50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
            <Badge className={getStatusColor(invoice.status)} variant="secondary">
              {invoice.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {invoice.customer_first_name} {invoice.customer_last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(invoice.created_at))} ago
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="text-right mr-4">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-lg font-semibold">${invoice.total?.toFixed(2)}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            {invoice.status === 'draft' && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onEdit?.(invoice)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            )}
            <Button 
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="gap-2"
            >
              View
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
