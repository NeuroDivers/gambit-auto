
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface InvoiceNotesFieldProps {
  value: string;
  onChange: (notes: string) => void;
  disabled?: boolean;
}

const InvoiceNotesField: React.FC<InvoiceNotesFieldProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add notes for this invoice"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px]"
        disabled={disabled}
      />
    </div>
  );
};

export default InvoiceNotesField;
