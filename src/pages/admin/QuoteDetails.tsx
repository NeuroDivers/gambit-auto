
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { Loader2, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { PageTitle } from "@/components/shared/PageTitle"

export default function QuoteDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

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
            <p>Failed to load estimate details. The estimate might not exist or you may not have permission to view it.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/admin/quotes')}
            >
              Return to Estimates
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="self-start"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <PageTitle 
            title={`Estimate ${quote.quote_number}`}
            description="View and manage estimate details"
          />
          <Badge 
            variant={
              quote.status === 'accepted' ? 'default' : 
              quote.status === 'rejected' ? 'destructive' : 
              'secondary'
            }
            className="self-start md:self-center"
          >
            {quote.status}
          </Badge>
        </div>
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
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isMobile ? (
                <div className="space-y-4">
                  {quote.quote_items?.map((item) => (
                    <div key={item.id} className="border-b pb-4">
                      <div className="font-medium">{item.service_name}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div className="text-muted-foreground">Quantity:</div>
                        <div className="text-right">{item.quantity}</div>
                        <div className="text-muted-foreground">Price:</div>
                        <div className="text-right">${item.unit_price.toFixed(2)}</div>
                        <div className="text-muted-foreground">Total:</div>
                        <div className="text-right">${(item.quantity * item.unit_price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${quote.total.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Service</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.quote_items?.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.service_name}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                        <td className="text-right py-2">${(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="text-right py-2 font-medium">Total</td>
                      <td className="text-right py-2 font-medium">${quote.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              
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

      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(`/admin/quotes/${id}/edit`)}
        >
          Edit Estimate
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
