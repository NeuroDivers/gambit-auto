
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { forwardRef } from "react"

interface InvoiceItem {
  id: string;
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceDetailsCardProps {
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  qstAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  dueDate?: string;
  updatedAt?: string;
}

export const InvoiceDetailsCard = forwardRef<HTMLDivElement, InvoiceDetailsCardProps>(({
  status,
  items,
  subtotal,
  gstAmount,
  qstAmount,
  total,
  notes,
  createdAt,
  dueDate,
  updatedAt
}, ref) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoice Details</CardTitle>
        <Badge 
          variant={
            status === 'paid' ? 'default' : 
            status === 'overdue' ? 'destructive' : 
            'secondary'
          }
        >
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" ref={ref}>
          <div>
            <p className="font-medium mb-2">Services</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.service_name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableBody className="border-t-2">
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">Subtotal</TableCell>
                  <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">GST</TableCell>
                  <TableCell className="text-right">${gstAmount.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">QST</TableCell>
                  <TableCell className="text-right">${qstAmount.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
                  <TableCell className="text-right font-bold">${total.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {notes && (
            <div>
              <p className="font-medium mb-2">Notes</p>
              <p className="text-muted-foreground">{notes}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Created: {format(new Date(createdAt), 'PPP')}</p>
            {dueDate && (
              <p>Due Date: {format(new Date(dueDate), 'PPP')}</p>
            )}
            {updatedAt && (
              <p>Last Updated: {format(new Date(updatedAt), 'PPP')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
InvoiceDetailsCard.displayName = 'InvoiceDetailsCard'
