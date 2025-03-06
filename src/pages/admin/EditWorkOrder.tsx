
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PageTitle } from "@/components/shared/PageTitle"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function EditWorkOrder() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          work_order_services (
            id,
            service_id,
            quantity,
            unit_price,
            commission_rate,
            commission_type,
            main_service_id,
            sub_service_id
          ),
          service_bays!fk_work_orders_assigned_bay (
            id,
            name
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching work order:', error)
        throw error
      }

      return data
    },
    enabled: !!id
  })

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!workOrder) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Work Order Not Found" 
            description="The requested work order could not be found."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Edit Work Order" 
            description="Update the work order details using the form below."
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-6 pt-4">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <WorkOrderForm
              workOrder={workOrder}
              onSuccess={() => {
                toast.success("Work order updated successfully")
                navigate('/work-orders')
              }}
            />
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  )
}
