
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Client } from "./types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

interface ClientDetailsDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  // Fetch client's quotes
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['client-quotes', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: open // Only fetch when dialog is open
  })

  // Fetch client's invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['client-invoices', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: open
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {client.first_name} {client.last_name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {client.email}
              </p>
              {client.phone_number && (
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {client.phone_number}
                </p>
              )}
              {client.address && (
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {client.address}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Quotes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {quotesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : quotes?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No quotes found</p>
              ) : (
                <div className="space-y-4">
                  {quotes?.slice(0, 3).map((quote) => (
                    <div
                      key={quote.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{quote.quote_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(quote.created_at))} ago
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${quote.total?.toFixed(2)}
                        </p>
                        <p className="text-sm capitalize text-muted-foreground">
                          {quote.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : invoices?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No invoices found</p>
              ) : (
                <div className="space-y-4">
                  {invoices?.slice(0, 3).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(invoice.created_at))} ago
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${invoice.total?.toFixed(2)}
                        </p>
                        <p className="text-sm capitalize text-muted-foreground">
                          {invoice.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
