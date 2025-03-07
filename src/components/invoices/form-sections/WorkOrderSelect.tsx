
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { WorkOrder } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type WorkOrderSelectProps = {
  workOrders?: WorkOrder[];
  selectedWorkOrderId?: string;
  onWorkOrderSelect?: (workOrderId: string) => void;
  value?: string;
  onChange?: (workOrderId: string) => void;
}

export function WorkOrderSelect({ 
  workOrders: propWorkOrders, 
  selectedWorkOrderId, 
  onWorkOrderSelect,
  value,
  onChange
}: WorkOrderSelectProps) {
  // If workOrders are not provided as props, fetch them
  const { data: fetchedWorkOrders } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      if (propWorkOrders) return null;
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          customer_first_name,
          customer_last_name,
          vehicle_make,
          vehicle_model
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !propWorkOrders
  });

  const workOrders = propWorkOrders || fetchedWorkOrders || [];
  const effectiveValue = value || selectedWorkOrderId || "";
  const handleValueChange = onChange || onWorkOrderSelect;

  return (
    <div>
      <Label>Work Order (Optional)</Label>
      <Select
        value={effectiveValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a work order to pre-fill form..." />
        </SelectTrigger>
        <SelectContent>
          {workOrders?.map((wo) => (
            <SelectItem key={wo.id} value={wo.id}>
              {wo.customer_first_name} {wo.customer_last_name} - {wo.vehicle_make} {wo.vehicle_model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
