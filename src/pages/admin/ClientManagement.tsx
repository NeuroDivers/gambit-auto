
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { ClientList } from "@/components/clients/ClientList"
import { CreateClientDialog } from "@/components/clients/CreateClientDialog"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, CreditCard, Calendar } from "lucide-react"

export default function ClientManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: clientStats } = useQuery({
    queryKey: ['clientStats'],
    queryFn: async () => {
      console.log("Fetching client statistics...")
      const { data, error } = await supabase
        .from('client_statistics')
        .select('*')
      
      if (error) {
        console.error("Error fetching client statistics:", error)
        throw error
      }

      // Calculate totals
      const totalClients = data.length
      const totalSpent = data.reduce((sum, client) => sum + (client.total_spent || 0), 0)
      const totalWorkOrders = data.reduce((sum, client) => sum + (client.total_work_orders || 0), 0)
      
      // Calculate active clients (had a work order or invoice in last 90 days)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const activeClients = data.filter(client => {
        const lastInvoiceDate = client.last_invoice_date ? new Date(client.last_invoice_date) : null
        const lastWorkOrderDate = client.last_work_order_date ? new Date(client.last_work_order_date) : null
        return (lastInvoiceDate && lastInvoiceDate > ninetyDaysAgo) || 
               (lastWorkOrderDate && lastWorkOrderDate > ninetyDaysAgo)
      }).length

      return {
        totalClients,
        activeClients,
        totalSpent,
        totalWorkOrders
      }
    }
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats?.activeClients || 0} active in last 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(clientStats?.totalSpent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime client spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats?.totalWorkOrders || 0}</div>
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
              {formatCurrency(clientStats?.totalClients ? (clientStats.totalSpent / clientStats.totalClients) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per client average
            </p>
          </CardContent>
        </Card>
      </div>

      <ClientList />
      
      <CreateClientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
