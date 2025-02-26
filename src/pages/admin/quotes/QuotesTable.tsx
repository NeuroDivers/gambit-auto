
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Quote {
  id: string
  quote_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  vehicle_year: number
  vehicle_make: string
  vehicle_model: string
  status: string
  total: number
  created_at: string
}

interface QuotesTableProps {
  quotes: Quote[]
  onRowClick: (id: string, type: 'quote') => void
}

export function QuotesTable({ quotes, onRowClick }: QuotesTableProps) {
  if (!quotes.length) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center">
          No quotes found
        </TableCell>
      </TableRow>
    )
  }

  return quotes.map((quote) => (
    <TableRow 
      key={quote.id}
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(quote.id, 'quote')}
    >
      <TableCell className="font-medium">
        {quote.quote_number}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">
            {quote.customer_first_name} {quote.customer_last_name}
          </p>
          <p className="text-sm text-muted-foreground">{quote.customer_email}</p>
        </div>
      </TableCell>
      <TableCell>
        {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
      </TableCell>
      <TableCell>
        <Badge 
          variant={quote.status as "pending" | "accepted" | "rejected" | "estimated"}
        >
          {quote.status}
        </Badge>
      </TableCell>
      <TableCell>
        ${quote.total.toFixed(2)}
      </TableCell>
      <TableCell>
        {format(new Date(quote.created_at), 'MMM d, yyyy')}
      </TableCell>
    </TableRow>
  ))
}
