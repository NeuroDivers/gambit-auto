
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CustomerList } from "@/components/customers/CustomerList"
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, CreditCard, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function CustomerManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: customerStats, isLoading } = useQuery({
    queryKey: ['customerStats'],
    queryFn: async () => {
      console.log("Fetching customer statistics...")
      const { data, error } = await supabase
        .from('client_statistics')
        .select('*')
      
      if (error) {
        console.error("Error fetching customer statistics:", error)
        toast.error("Failed to load customer statistics")
        throw error
      }

      // Calculate totals
      const totalCustomers = data.length
      const totalSpent = data.reduce((sum, customer) => sum + (customer.total_spent || 0), 0)
      const totalWorkOrders = data.reduce((sum, customer) => sum + (customer.total_work_orders || 0), 0)
      
      // Calculate active customers (had a work order or invoice in last 90 days)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const activeCustomers = data.filter(customer => {
        const lastInvoiceDate = customer.last_invoice_date ? new Date(customer.last_invoice_date) : null
        const lastWorkOrderDate = customer.last_work_order_date ? new Date(customer.last_work_order_date) : null
        return (lastInvoiceDate && lastInvoiceDate > ninetyDaysAgo) || 
               (lastWorkOrderDate && lastWorkOrderDate > ninetyDaysAgo)
      }).length

      return {
        totalCustomers,
        activeCustomers,
        totalSpent,
        totalWorkOrders
      }
    }
  })

  // Show loading state
  const loadingValue = <div className="animate-pulse bg-muted h-8 w-20 rounded" />

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? loadingValue : customerStats?.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? loadingValue : `${customerStats?.activeCustomers || 0} active in last 90 days`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? loadingValue : formatCurrency(customerStats?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime customer spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? loadingValue : customerStats?.totalWorkOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total work orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading 
                ? loadingValue 
                : formatCurrency(customerStats?.totalCustomers 
                    ? (customerStats.totalSpent / customerStats.totalCustomers) 
                    : 0
                  )}
            </div>
            <p className="text-xs text-muted-foreground">
              Per customer average
            </p>
          </CardContent>
        </Card>
      </div>

      <CustomerList />
      
      <CreateCustomerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
