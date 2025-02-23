
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Client } from "@/components/clients/types"

interface ClientHistoryProps {
  client: Client
}

export function ClientHistory({ client }: ClientHistoryProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-4">
        {[...(client.invoices || []), ...(client.quotes || [])]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {'invoice_number' in item ? `Invoice #${item.invoice_number}` : `Quote #${item.quote_number}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${item.total}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </ScrollArea>
  )
}
