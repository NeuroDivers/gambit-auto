
import { Customer } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface CustomerQuotesProps {
  customer: Customer
}

export function CustomerQuotes({ customer }: CustomerQuotesProps) {
  const navigate = useNavigate()

  if (!customer.quotes || customer.quotes.length === 0) {
    return (
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Estimates</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 flex items-center justify-center flex-col h-32">
          <p className="text-muted-foreground">No estimates found for this customer.</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Estimates</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Estimate #</th>
                <th className="text-left py-3 font-medium">Date</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-right py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer.quotes.map((quote) => (
                <tr key={quote.id} className="border-b">
                  <td className="py-3">{quote.quote_number}</td>
                  <td className="py-3">
                    {new Date(quote.created_at).toLocaleDateString()}
                    <span className="text-xs text-muted-foreground block">
                      {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="py-3">{formatCurrency(quote.total)}</td>
                  <td className="py-3">
                    <Badge variant="outline" className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/quotes/${quote.id}`)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
