import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
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
import { Loader2, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { PageTitle } from "@/components/shared/PageTitle"
import { InvoiceActions } from "@/components/invoices/sections/InvoiceActions"
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

export default function InvoiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    documentTitle: 'Invoice',
    contentRef: printRef,
  })

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID is required")

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            id,
            service_name,
            quantity,
            unit_price,
            description
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error("Invoice not found")

      console.log('Fetched invoice:', data)
      return data
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load invoice details. The invoice might not exist or you may not have permission to view it.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/admin/invoices')}
            >
              Return to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title={`Invoice ${invoice.invoice_number}`}
            description="View and manage invoice details"
          />
        </div>
        <InvoiceActions 
          invoiceId={id} 
          onPrint={handlePrint}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Name</p>
              <p>{invoice.customer_first_name} {invoice.customer_last_name}</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p>{invoice.customer_email}</p>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <p>{invoice.customer_phone}</p>
            </div>
            {invoice.customer_address && (
              <div>
                <p className="font-medium">Address</p>
                <p>{invoice.customer_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Vehicle</p>
              <p>{invoice.vehicle_year} {invoice.vehicle_make} {invoice.vehicle_model}</p>
            </div>
            {invoice.vehicle_vin && (
              <div>
                <p className="font-medium">VIN</p>
                <p>{invoice.vehicle_vin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Details</CardTitle>
            <Badge 
              variant={
                invoice.status === 'paid' ? 'default' : 
                invoice.status === 'overdue' ? 'destructive' : 
                'secondary'
              }
            >
              {invoice.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" ref={printRef}>
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
                    {invoice.invoice_items?.map((item) => (
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
                      <TableCell className="text-right">${invoice.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">GST</TableCell>
                      <TableCell className="text-right">${invoice.gst_amount.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">QST</TableCell>
                      <TableCell className="text-right">${invoice.qst_amount.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">${invoice.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {invoice.notes && (
                <div>
                  <p className="font-medium mb-2">Notes</p>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Created: {format(new Date(invoice.created_at), 'PPP')}</p>
                {invoice.due_date && (
                  <p>Due Date: {format(new Date(invoice.due_date), 'PPP')}</p>
                )}
                {invoice.updated_at && (
                  <p>Last Updated: {format(new Date(invoice.updated_at), 'PPP')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(`/admin/invoices/${id}/edit`)}
        >
          Edit Invoice
        </Button>
        {invoice.status !== 'paid' && (
          <Button>
            Mark as Paid
          </Button>
        )}
      </div>
    </div>
  )
}
