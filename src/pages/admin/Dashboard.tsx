
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Wrench, 
  FileText, 
  MessageSquare, 
  Users, 
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function Dashboard() {
  // Fetch work order statistics
  const { data: workOrderStats } = useQuery({
    queryKey: ["work-order-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_statistics')
        .select('*')
        .single()
      
      if (error) throw error
      return data
    }
  })

  // Fetch invoice statistics
  const { data: invoiceStats } = useQuery({
    queryKey: ["invoice-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_statistics')
        .select('*')
        .single()
      
      if (error) throw error
      return data
    }
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening in your business today.</p>
        </div>
        <Link to="/admin/work-orders/create">
          <Button>Create Work Order</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrderStats?.in_progress_work_orders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {workOrderStats?.pending_work_orders || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((invoiceStats?.collected_revenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {invoiceStats?.total_invoices || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Service Bay Status</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrderStats?.active_bays || 0}/{workOrderStats?.total_bays || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bays in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceStats?.pending_invoices || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/admin/work-orders">
              <Button className="w-full" variant="outline">View Work Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/admin/work-orders">
              <Button className="w-full" variant="outline">View Schedule</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quotes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/admin/quotes">
              <Button className="w-full" variant="outline">Manage Quotes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/admin/clients">
              <Button className="w-full" variant="outline">Manage Clients</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              View your recent work orders in the Work Orders section
            </div>
            <Link to="/admin/work-orders" className="block mt-4">
              <Button variant="outline" className="w-full">View All Work Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Check your recent invoices in the Invoices section
            </div>
            <Link to="/admin/invoices" className="block mt-4">
              <Button variant="outline" className="w-full">View All Invoices</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
