
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Client } from "@/components/clients/types"

interface ClientInvoicesProps {
  client: Client
}

export function ClientInvoices({ client }: ClientInvoicesProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-4">
        {client.invoices?.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${invoice.total}</p>
                  <p className="text-sm text-muted-foreground capitalize">{invoice.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
