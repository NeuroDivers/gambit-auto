
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderData() {
  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      // Fetch work orders first
      const { data: workOrders, error: workOrdersError } = await supabase
        .from("work_orders")
        .select("*")
        .order('created_at', { ascending: false });

      if (workOrdersError) throw workOrdersError;

      if (!workOrders?.length) return [];
      
      // Then fetch all work order services with their relationships
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
            name,
            price
          ),
          main_service:service_types!work_order_services_main_service_id_fkey (
            id,
            name,
            price
          ),
          sub_service:service_types!work_order_services_sub_service_id_fkey (
            id,
            name,
            price
          )
        `)
        .in('work_order_id', workOrders.map(wo => wo.id))
        .not('work_order_id', 'is', null);

      if (servicesError) throw servicesError;

      // Group services by work order ID
      const servicesByWorkOrder = (servicesData || []).reduce((acc, service) => {
        if (!acc[service.work_order_id]) {
          acc[service.work_order_id] = [];
        }
        acc[service.work_order_id].push(service);
        return acc;
      }, {} as Record<string, typeof servicesData>);

      // Merge services into work orders
      return workOrders.map(workOrder => ({
        ...workOrder,
        work_order_services: servicesByWorkOrder[workOrder.id] || []
      }));
    }
  })
}
