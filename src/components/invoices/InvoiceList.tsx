import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { format } from "date-fns"

export function InvoiceList() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices?.map((invoice) => (
        <Link key={invoice.id} to={`/invoices/${invoice.id}`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{invoice.invoice_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoice.work_order.first_name} {invoice.work_order.last_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${invoice.total}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(invoice.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}