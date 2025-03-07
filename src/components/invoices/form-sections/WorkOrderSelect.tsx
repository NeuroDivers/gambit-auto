
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "../types";

export interface WorkOrderSelectProps {
  value?: string;
  onChange?: (workOrderId: string) => Promise<void>;
  workOrders?: any[];
  disabled?: boolean;
  form?: UseFormReturn<InvoiceFormValues>;
}

export const WorkOrderSelect: React.FC<WorkOrderSelectProps> = ({ 
  value, 
  onChange, 
  workOrders = [], 
  disabled = false,
  form
}) => {
  const workOrderId = form ? form.watch('work_order_id') || '' : value || '';

  const handleChange = async (id: string) => {
    if (form) {
      form.setValue('work_order_id', id);
    }
    
    if (onChange) {
      await onChange(id);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="workOrder">Work Order</Label>
      <Select
        value={workOrderId}
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
