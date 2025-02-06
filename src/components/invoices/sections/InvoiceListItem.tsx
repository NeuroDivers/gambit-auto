import { format } from "date-fns"
import { MoreHorizontal, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { Invoice } from "../types"

type InvoiceListItemProps = {
  invoice: Invoice
  onEdit: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export function InvoiceListItem({ invoice, onEdit, onStatusChange }: InvoiceListItemProps) {
  const serviceNames = invoice.invoice_items && invoice.invoice_items.length > 0
    ? invoice.invoice_items.map(item => item.service_name).join(", ")
    : 'No services listed'

  return (
    <Link 
      to={`/invoices/${invoice.id}`}
      className="block"
    >
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-semibold">{invoice.invoice_number}</h3>
              <p className="text-sm text-muted-foreground">
                {invoice.customer_first_name} {invoice.customer_last_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {invoice.customer_email} • {invoice.customer_phone}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                Services: {serviceNames}
              </p>
            </div>
            <div className="text-right flex-1">
              <p className="font-semibold">${invoice.total}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(invoice.created_at), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Due: {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : 'Not set'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit(invoice.id)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault()
                    onStatusChange(invoice.id, "draft")
                  }}>
                    Set as Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault()
                    onStatusChange(invoice.id, "pending")
                  }}>
                    Set as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault()
                    onStatusChange(invoice.id, "paid")
                  }}>
                    Set as Paid
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}