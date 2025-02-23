
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Client } from "@/components/clients/types"

interface ClientQuotesProps {
  client: Client
}

export function ClientQuotes({ client }: ClientQuotesProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-4">
        {client.quotes?.map((quote) => (
          <Card key={quote.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Quote #{quote.quote_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${quote.total}</p>
                  <p className="text-sm text-muted-foreground capitalize">{quote.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
