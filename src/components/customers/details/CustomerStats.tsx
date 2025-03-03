
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Customer } from "../types"
import { CreditCard, FileText, CheckSquare } from "lucide-react"

interface CustomerStatsProps {
  customer: Customer
}

export function CustomerStats({ customer }: CustomerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(customer.total_spent || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Lifetime spending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {customer.total_invoices || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Total invoices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {customer.total_work_orders || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Completed work orders
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
