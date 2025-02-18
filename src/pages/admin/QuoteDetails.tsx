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

export default function QuoteDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      if (!id) throw new Error("Quote ID is required")

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (
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
      if (!data) throw new Error("Quote not found")
      
      console.log('Fetched quote:', data)
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

  if (error || !quote) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load quote details. The quote might not exist or you may not have permission to view it.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/admin/quotes')}
            >
              Return to Quotes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title={`Quote ${quote.quote_number}`}
          description="View and manage quote details"
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
              <p>{quote.customer_first_name} {quote.customer_last_name}</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p>{quote.customer_email}</p>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <p>{quote.customer_phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Vehicle</p>
              <p>{quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}</p>
            </div>
            <div>
              <p className="font-medium">VIN</p>
              <p>{quote.vehicle_vin || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quote Details</CardTitle>
            <Badge 
              variant={
                quote.status === 'accepted' ? 'default' : 
                quote.status === 'rejected' ? 'destructive' : 
                'secondary'
              }
            >
              {quote.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Services</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.quote_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.service_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                      <TableCell className="font-medium">${quote.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {quote.notes && (
                <div>
                  <p className="font-medium mb-2">Notes</p>
                  <p className="text-muted-foreground">{quote.notes}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Created: {format(new Date(quote.created_at), 'PPP')}</p>
                {quote.updated_at && (
                  <p>Last Updated: {format(new Date(quote.updated_at), 'PPP')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(`/admin/quotes/${id}/edit`)}
        >
          Edit Quote
        </Button>
        <Button 
          onClick={() => navigate(`/admin/invoices/create?quote_id=${id}`)}
        >
          Create Invoice
        </Button>
      </div>
    </div>
  )
}
