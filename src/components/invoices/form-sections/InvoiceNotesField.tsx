import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"

type InvoiceNotesFieldProps = {
  form?: UseFormReturn<InvoiceFormValues>;
  value?: string;
  onChange?: (value: string) => void;
}

export function InvoiceNotesField({ form, value, onChange }: InvoiceNotesFieldProps) {
  // If form is provided, use React Hook Form pattern
  if (form) {
    return (
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add notes to this invoice..." 
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    );
  }
  
  // Otherwise use controlled component pattern
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Notes</label>
      <Textarea
        placeholder="Add notes to this invoice..."
        className="min-h-[100px]"
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
}
