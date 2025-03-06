
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

      // Fetch the work order details
      const { data: workOrder, error: workOrderError } = await supabase
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
            assigned_profile_id,
            service_types (
              id,
              name,
              description
            )
          )
        `)
        .eq('id', workOrderId)
        .single();

      if (workOrderError) throw workOrderError;

      // Calculate subtotal from work order services
      const subtotal = workOrder.work_order_services.reduce(
        (sum: number, service: any) => sum + (service.quantity * service.unit_price),
        0
      );

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          work_order_id: workOrderId,
          status: 'draft',
          customer_first_name: workOrder.customer_first_name,
          customer_last_name: workOrder.customer_last_name,
          customer_email: workOrder.customer_email,
          customer_phone: workOrder.customer_phone,
          vehicle_make: workOrder.vehicle_make,
          vehicle_model: workOrder.vehicle_model,
          vehicle_year: workOrder.vehicle_year,
          vehicle_vin: workOrder.vehicle_vin,
          subtotal: subtotal,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          notes: workOrder.additional_notes
        })
        .select('id')
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items from work order services
      if (workOrder.work_order_services.length > 0) {
        const invoiceItems = workOrder.work_order_services.map((service: any) => ({
          invoice_id: invoice.id,
          service_id: service.service_id,
          service_name: service.service_types?.name || 'Unknown Service',
          description: service.service_types?.description || '',
          quantity: service.quantity,
          unit_price: service.unit_price,
          commission_rate: service.commission_rate,
          commission_type: service.commission_type,
          assigned_profile_id: service.assigned_profile_id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      return invoice.id;
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
