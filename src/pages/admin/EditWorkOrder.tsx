
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { useParams } from "react-router-dom"

export default function EditWorkOrder() {
  const { id } = useParams()

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          work_order_services (
            service_id,
            quantity,
            unit_price,
            service_types!work_order_services_service_id_fkey (
              id,
              name,
              description,
              price
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!workOrder) {
    return <div>Work order not found</div>
  }

  return (
    <div className="space-y-4">
      <WorkOrderForm
        workOrder={workOrder}
        onSuccess={() => {
          // Handle success if needed
        }}
      />
    </div>
  )
}
