
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useWorkOrderSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up global work order subscription");
    
    // Subscribe to all work order changes
    const workOrdersChannel = supabase
      .channel('global-work-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders'
        },
        (payload) => {
          console.log("Work order change detected:", payload);
          
          // Invalidate the work orders list query
          queryClient.invalidateQueries({ queryKey: ['work-orders'] });
          
          // If it's a specific work order, invalidate its individual query
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['workOrder', payload.new.id] });
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
            'id' in payload.new
          ) {
            const workOrderId = String(payload.new.id).substring(0, 8);
            toast.success(
              `Work Order #${workOrderId} status updated to ${payload.new.status}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up global work order subscription");
      supabase.removeChannel(workOrdersChannel);
    };
  }, [queryClient]);
}
