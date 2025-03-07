
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useInvoiceSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up global invoice subscription");
    
    // Subscribe to all invoice changes
    const invoicesChannel = supabase
      .channel('global-invoices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        (payload) => {
          console.log("Invoice change detected:", payload);
          
          // Invalidate the invoices list query
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          
          // If it's a specific invoice, invalidate its individual query
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['invoice', payload.new.id] });
          }
          
          // Show notification for status changes
          if (
            payload.eventType === 'UPDATE' && 
            payload.old && 
            payload.new && 
            typeof payload.old === 'object' && 
            typeof payload.new === 'object' && 
            'status' in payload.old && 
            'status' in payload.new && 
            payload.old.status !== payload.new.status &&
            'invoice_number' in payload.new
          ) {
            const invoiceNumber = payload.new.invoice_number;
            toast.success(
              `Invoice #${invoiceNumber} status updated to ${payload.new.status}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up global invoice subscription");
      supabase.removeChannel(invoicesChannel);
    };
  }, [queryClient]);
}
