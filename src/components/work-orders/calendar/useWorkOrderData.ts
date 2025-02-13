
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderData() {
  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data: workOrders, error: workOrdersError } = await supabase
        .from("work_orders")
        .select("*")
        .order('created_at', { ascending: false });

      if (workOrdersError) throw workOrdersError;

      // Fetch services for all work orders in a single query
      const workOrderIds = workOrders.map(wo => wo.id);
      
      const { data: servicesData, error: servicesError } = await supabase
        .from("work_order_services")
        .select(`
          id,
          work_order_id,
          service_id,
          quantity,
          unit_price,
          service:service_types!work_order_services_service_id_fkey (
            id,
            name
          )
        `)
        .in('work_order_id', workOrderIds);

      if (servicesError) throw servicesError;

      // Group services by work order ID
      const servicesByWorkOrder = servicesData.reduce((acc, service) => {
        if (!acc[service.work_order_id]) {
          acc[service.work_order_id] = [];
        }
        acc[service.work_order_id].push(service);
        return acc;
      }, {});

      // Merge services into work orders
      return workOrders.map(workOrder => ({
        ...workOrder,
        work_order_services: servicesByWorkOrder[workOrder.id] || []
      }));
    }
  })
}
