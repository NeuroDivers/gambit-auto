
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "../types";

export interface InvoiceNotesFieldProps {
  value?: string;
  onChange?: (notes: string) => void;
  disabled?: boolean;
  form?: UseFormReturn<InvoiceFormValues>;
}

export const InvoiceNotesField: React.FC<InvoiceNotesFieldProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  form
}) => {
  // If form is provided, use it, otherwise use the direct value/onChange props
  const notes = form ? form.watch('notes') : value;
  const handleChange = (newValue: string) => {
    if (form) {
      form.setValue('notes', newValue);
    } else if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add notes for this invoice"
        value={notes || ""}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[100px]"
        disabled={disabled}
      />
    </div>
  );
};

export default InvoiceNotesField;
