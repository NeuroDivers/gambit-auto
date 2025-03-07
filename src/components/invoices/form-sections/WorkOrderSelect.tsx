
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface WorkOrderSelectProps {
  value: string;
  onChange: (workOrderId: string) => Promise<void>;
  workOrders: any[];
  disabled?: boolean;
}

export function WorkOrderSelect({ value, onChange, workOrders, disabled = false }: WorkOrderSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="work_order_id">Work Order</Label>
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="work_order_id" className="w-full">
          <SelectValue placeholder="Select work order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {workOrders.map((order) => (
            <SelectItem key={order.id} value={order.id}>
              {`WO-${order.id.substring(0, 8)} - ${order.vehicle_make} ${order.vehicle_model}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
