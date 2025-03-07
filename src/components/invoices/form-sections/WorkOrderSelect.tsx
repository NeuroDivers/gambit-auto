
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface WorkOrderSelectProps {
  value: string;
  onChange: (workOrderId: string) => Promise<void>;
  workOrders: any[];
  disabled?: boolean;
}

const WorkOrderSelect: React.FC<WorkOrderSelectProps> = ({ 
  value, 
  onChange, 
  workOrders, 
  disabled = false 
}) => {
  const handleChange = async (id: string) => {
    await onChange(id);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="workOrder">Work Order</Label>
      <Select
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger id="workOrder" className="w-full">
          <SelectValue placeholder="Select work order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {workOrders.map((order) => (
            <SelectItem key={order.id} value={order.id}>
              #{order.workOrderNumber} - {order.customerFirstName} {order.customerLastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkOrderSelect;
