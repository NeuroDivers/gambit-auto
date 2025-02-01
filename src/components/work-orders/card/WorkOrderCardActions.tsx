import { Button } from "@/components/ui/button"
import { WorkOrder } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

type WorkOrderCardActionsProps = {
  request: WorkOrder
}

export function WorkOrderCardActions({ request }: WorkOrderCardActionsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .update({ status })
        .eq("id", request.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Work order marked as ${status}`,
      })

      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const createInvoice = async () => {
    try {
      const { data, error } = await supabase
        .rpc('create_invoice_from_work_order', {
          work_order_id: request.id
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      navigate(`/invoices/${data}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (request.status === "pending") {
    return (
      <div className="flex gap-2 justify-end pt-3 border-t border-border/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateStatus("rejected")}
          className="hover:bg-destructive/20"
        >
          Reject
        </Button>
        <Button
          size="sm"
          onClick={() => updateStatus("approved")}
          className="hover:bg-primary/20"
        >
          Approve
        </Button>
      </div>
    )
  }

  if (request.status === "completed") {
    return (
      <div className="flex justify-end pt-3 border-t border-border/20">
        <Button
          size="sm"
          onClick={createInvoice}
          className="hover:bg-primary/20"
        >
          Convert to Invoice
        </Button>
      </div>
    )
  }

  return null
}