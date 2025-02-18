
import { PageTitle } from "@/components/shared/PageTitle"
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

export default function EditWorkOrder() {
  const navigate = useNavigate()
  const { id } = useParams()

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          assigned_bay:service_bays!fk_work_orders_assigned_bay (
            name
          ),
          assigned_to:profiles!assigned_profile_id (
            first_name,
            last_name
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="p-6">
        <p className="text-destructive">Work order not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Edit Work Order" 
        description="Make changes to this work order using the form below."
      />
      <div className="rounded-lg border bg-card p-6">
        <WorkOrderForm 
          workOrder={workOrder}
          onSuccess={() => navigate("/admin/work-orders")}
        />
      </div>
    </div>
  )
}
