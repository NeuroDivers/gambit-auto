
import { Customer } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface CustomerInvoicesProps {
  customer: Customer
}

export function CustomerInvoices({ customer }: CustomerInvoicesProps) {
  const navigate = useNavigate()

  if (!customer.invoices || customer.invoices.length === 0) {
    return (
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 flex items-center justify-center flex-col h-32">
          <p className="text-muted-foreground">No invoices found for this customer.</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Invoice #</th>
                <th className="text-left py-3 font-medium">Date</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-right py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer.invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="py-3">{invoice.invoice_number}</td>
                  <td className="py-3">
                    {new Date(invoice.created_at).toLocaleDateString()}
                    <span className="text-xs text-muted-foreground block">
                      {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="py-3">{formatCurrency(invoice.total)}</td>
                  <td className="py-3">
                    <Badge variant="outline" className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${invoice.id}`)}>
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
