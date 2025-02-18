
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"

type InvoiceStatusFieldProps = {
  form: UseFormReturn<InvoiceFormValues>
  defaultValue?: string
}

export function InvoiceStatusField({ form, defaultValue }: InvoiceStatusFieldProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={defaultValue || field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
