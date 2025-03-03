
import { Customer } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CustomerHistoryProps {
  customer: Customer
}

export function CustomerHistory({ customer }: CustomerHistoryProps) {
  // We'll implement a simple placeholder until the full history implementation is ready
  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Customer History</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <p className="text-muted-foreground">Customer history will be displayed here.</p>
      </CardContent>
    </Card>
  )
}
