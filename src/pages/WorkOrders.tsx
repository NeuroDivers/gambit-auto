
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const STATUS_COLORS = {
  pending: "#FFA500",
  approved: "#3B82F6",
  rejected: "#EF4444",
  completed: "#10B981"
}

export default function WorkOrders() {
  const navigate = useNavigate()

  // Check if user is an admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'administrator'
      })
      
      return !!data
    }
  })

  // Fetch work order statistics
  const { data: stats } = useQuery({
    queryKey: ["workOrderStats"],
    queryFn: async () => {
      const { count } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })

      const { data: statusCounts } = await supabase
        .from('work_orders')
        .select('status')
        .eq('is_archived', false)

      const counts = {
        total: count || 0,
        pending: statusCounts?.filter(wo => wo.status === 'pending').length || 0,
        approved: statusCounts?.filter(wo => wo.status === 'approved').length || 0,
        rejected: statusCounts?.filter(wo => wo.status === 'rejected').length || 0,
        completed: statusCounts?.filter(wo => wo.status === 'completed').length || 0
      }

      return counts
    }
  })

  // Prepare data for pie chart
  const pieChartData = stats ? [
    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
    { name: 'Approved', value: stats.approved, color: STATUS_COLORS.approved },
    { name: 'Rejected', value: stats.rejected, color: STATUS_COLORS.rejected },
    { name: 'Completed', value: stats.completed, color: STATUS_COLORS.completed }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-4 px-4 lg:px-8">
        <div className="sticky top-4 z-10">
          {isAdmin && (
            <Button 
              onClick={() => navigate("/work-orders/create")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Create Work Order
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FFA500]">{stats?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats?.approved || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{stats?.completed || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Work Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-[1600px] mx-auto mt-6">
          <WorkOrderList />
        </div>
      </div>
    </div>
  )
}
