
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"

export default function ClientInvoices() {
  const navigate = useNavigate()

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['clientInvoices'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // First get the client id
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientData) return []

      // Then get the invoices
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!invoices?.length) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <PageBreadcrumbs />
          <h1 className="text-2xl md:text-3xl font-bold">My Invoices</h1>
        </div>
        <Card className="p-8 text-center text-muted-foreground">
          No invoices found.
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <h1 className="text-2xl md:text-3xl font-bold">My Invoices</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow 
                key={invoice.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/client/invoices/${invoice.id}`)}
              >
                <TableCell className="font-medium">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      invoice.status === 'paid' ? 'default' : 
                      invoice.status === 'overdue' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  ${invoice.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
