
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "../types";

export interface InvoiceStatusFieldProps {
  value?: string;
  onChange?: (status: string) => void;
  disabled?: boolean;
  form?: UseFormReturn<InvoiceFormValues>;
  defaultValue?: string;
}

export const InvoiceStatusField: React.FC<InvoiceStatusFieldProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  form,
  defaultValue = 'draft'
}) => {
  // If form is provided, use it, otherwise use the direct value/onChange props
  const status = form ? form.watch('status') || defaultValue : value || defaultValue;
  
  const handleChange = (newValue: string) => {
    if (form) {
      form.setValue('status', newValue);
    } else if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="invoiceStatus">Status</Label>
      <Select
        value={status}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger id="invoiceStatus" className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default InvoiceStatusField;
