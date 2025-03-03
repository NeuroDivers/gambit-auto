
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Customer } from "@/components/customers/types"

interface CustomerQuotesProps {
  customer: Customer
}

export function CustomerQuotes({ customer }: CustomerQuotesProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-4">
        {customer.quotes?.map((estimate) => (
          <Card key={estimate.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Estimate #{estimate.quote_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(estimate.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${estimate.total}</p>
                  <p className="text-sm text-muted-foreground capitalize">{estimate.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
