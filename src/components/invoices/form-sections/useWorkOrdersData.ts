
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrdersData() {
  return useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      // First fetch work orders
      const { data: workOrders, error: workOrdersError } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (workOrdersError) throw workOrdersError

      // Then fetch services with explicit foreign key relationship
      const { data: services, error: servicesError } = await supabase
        .from("work_order_services")
        .select(`
          id,
          work_order_id,
          service_id,
          quantity,
          unit_price,
          service:service_types!work_order_services_service_id_fkey (
            id,
            name,
            price
          )
        `)
        .in('work_order_id', workOrders.map(wo => wo.id))

      if (servicesError) throw servicesError

      // Combine the data
      return workOrders.map(workOrder => ({
        ...workOrder,
        work_order_services: services.filter(
          service => service.work_order_id === workOrder.id
        )
      }))
    }
  })
}
