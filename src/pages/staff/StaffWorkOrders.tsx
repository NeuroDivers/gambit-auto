
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkOrderStatusSelect } from "@/components/work-orders/components/WorkOrderStatusSelect"

export default function StaffWorkOrders() {
  // Fetch assigned work orders
  const { data: assignedOrders, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['staff-work-orders', 'assigned'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          service_bays (name),
          work_order_services (
            id,
            service_id,
            quantity,
            unit_price,
            service_types!work_order_services_main_service_id_fkey (
              name,
              description
            )
          )
        `)
        .eq('assigned_profile_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching assigned orders:', error)
        throw error
      }
      console.log('Assigned orders:', data)
      return data
    }
  })

  // Fetch available work orders
  const { data: availableOrders, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['staff-work-orders', 'available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          service_bays (name),
          work_order_services (
            id,
            service_id,
            quantity,
            unit_price,
            service_types!work_order_services_main_service_id_fkey (
              name,
              description
            )
          )
        `)
        .is('assigned_profile_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching available orders:', error)
        throw error
      }
      console.log('Available orders:', data)
      return data
    }
  })

  const handleApplyForWorkOrder = async (workOrderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('work_order_requests')
        .insert({
          work_order_id: workOrderId,
          profile_id: user.id,
          status: 'pending'
        })

      if (error) throw error

      toast.success("Application submitted successfully")
    } catch (error) {
      console.error('Error applying for work order:', error)
      toast.error("Failed to apply for work order")
    }
  }

  if (isLoadingAssigned || isLoadingAvailable) {
    return <LoadingScreen />
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Work Orders</h1>
      
      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assigned">My Work Orders ({assignedOrders?.length || 0})</TabsTrigger>
          <TabsTrigger value="available">Available Orders ({availableOrders?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          {assignedOrders?.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    {order.first_name} {order.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
                  </p>
                </div>
                <WorkOrderStatusSelect workOrder={order} />
              </div>
              <div className="space-y-2">
                {order.service_bays?.name && (
                  <p className="text-sm">Bay: {order.service_bays.name}</p>
                )}
                {order.work_order_services && order.work_order_services.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Services:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {order.work_order_services.map((service: any) => (
                        <li key={service.id}>
                          {service.service_types?.name} x {service.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {order.additional_notes && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Notes:</span> {order.additional_notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
          {assignedOrders?.length === 0 && (
            <p className="text-center text-muted-foreground">
              No work orders assigned to you yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {availableOrders?.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => handleApplyForWorkOrder(order.id)}
                >
                  Apply
                </Button>
              </div>
              <div className="space-y-2">
                {order.service_bays?.name && (
                  <p className="text-sm">Bay: {order.service_bays.name}</p>
                )}
                {order.work_order_services && order.work_order_services.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Services:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {order.work_order_services.map((service: any) => (
                        <li key={service.id}>
                          {service.service_types?.name} x {service.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {order.additional_notes && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Notes:</span> {order.additional_notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
          {availableOrders?.length === 0 && (
            <p className="text-center text-muted-foreground">
              No available work orders at the moment.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
