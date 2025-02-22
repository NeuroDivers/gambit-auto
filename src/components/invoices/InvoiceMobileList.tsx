
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Invoice } from "./types"

interface InvoiceMobileListProps {
  invoices: Invoice[]
  onRowClick: (id: string) => void
}

export function InvoiceMobileList({ invoices, onRowClick }: InvoiceMobileListProps) {
  if (!invoices?.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No invoices found
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card 
          key={invoice.id} 
          className="p-4 space-y-4 cursor-pointer hover:bg-accent/5"
          onClick={() => onRowClick(invoice.id)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">
                {invoice.customer_first_name} {invoice.customer_last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
            </div>
            <Badge 
              variant={
                invoice.status === 'paid' ? 'default' : 
                invoice.status === 'overdue' ? 'destructive' : 
                'secondary'
              }
            >
              {invoice.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Invoice #{invoice.invoice_number}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due: {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'Not set'}
            </div>

            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              ${invoice.total.toFixed(2)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
