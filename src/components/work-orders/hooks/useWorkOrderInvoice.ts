
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function useWorkOrderInvoice() {
  const navigate = useNavigate()

  const handleCreateInvoice = async (workOrderId: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'create_invoice_from_work_order',
        { work_order_id: workOrderId }
      )

      if (error) throw error

      toast.success("Invoice created successfully")
      navigate(`/admin/invoices/${data}/edit`)
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create invoice")
    }
  };

  return {
    handleCreateInvoice,
  };
}
