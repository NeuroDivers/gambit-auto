
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useWorkOrderInvoice() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createInvoiceMutation = useMutation({
    mutationFn: async (workOrderId: string) => {
      // First update the work order status to "invoiced"
      const { error: statusError } = await supabase
        .from('work_orders')
        .update({ status: 'invoiced' })
        .eq('id', workOrderId);
      
      if (statusError) throw statusError;

      // Then create the invoice
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          work_order_id: workOrderId,
          status: 'draft'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: (invoiceId) => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      // Navigate to the newly created invoice
      navigate(`/invoices/${invoiceId}/edit`);
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast.error("Failed to create invoice");
    }
  });

  return {
    createInvoice: (workOrderId: string) => createInvoiceMutation.mutate(workOrderId),
    isCreatingInvoice: createInvoiceMutation.isPending
  };
}
