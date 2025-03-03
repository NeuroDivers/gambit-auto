
import { useState } from "react"
import { Customer } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCustomerHistory } from "../hooks/useCustomerHistory"
import { CalendarIcon, CreditCard, FileText, MessageSquare, Package, User } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface CustomerHistoryProps {
  customer: Customer
}

export function CustomerHistory({ customer }: CustomerHistoryProps) {
  const { history, isLoading, error } = useCustomerHistory(customer.id)
  const [filter, setFilter] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Customer History</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <p className="text-muted-foreground">Loading customer history...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Customer History</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <p className="text-muted-foreground text-red-500">
            Error loading customer history. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const filteredHistory = filter 
    ? history.filter(item => item.event_type === filter)
    : history

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'invoice':
        return <CreditCard className="h-4 w-4 mr-2" />
      case 'quote':
        return <FileText className="h-4 w-4 mr-2" />
      case 'work_order':
        return <Package className="h-4 w-4 mr-2" />
      case 'note':
        return <MessageSquare className="h-4 w-4 mr-2" />
      case 'contact':
        return <User className="h-4 w-4 mr-2" />
      default:
        return <CalendarIcon className="h-4 w-4 mr-2" />
    }
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center">
          <CardTitle>Customer History</CardTitle>
          <div className="flex gap-2">
            <Badge 
              className={`cursor-pointer ${!filter ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => setFilter(null)}
            >
              All
            </Badge>
            <Badge 
              className={`cursor-pointer ${filter === 'invoice' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => setFilter('invoice')}
            >
              Invoices
            </Badge>
            <Badge 
              className={`cursor-pointer ${filter === 'quote' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => setFilter('quote')}
            >
              Quotes
            </Badge>
            <Badge 
              className={`cursor-pointer ${filter === 'work_order' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => setFilter('work_order')}
            >
              Work Orders
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {filteredHistory.length === 0 ? (
          <p className="text-muted-foreground">
            {filter ? `No ${filter} history available.` : 'No customer history available.'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {getEventIcon(item.event_type)}
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.event_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  {item.amount !== null && (
                    <Badge variant={item.amount > 0 ? "default" : "secondary"}>
                      {formatCurrency(item.amount)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
