
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface InvoiceStatusFieldProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export const InvoiceStatusField: React.FC<InvoiceStatusFieldProps> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="invoiceStatus">Status</Label>
      <Select
        value={value}
        onValueChange={onChange}
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
