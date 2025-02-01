import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"

type AddressFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function AddressField({ form }: AddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Address</FormLabel>
          <FormControl>
            <Input placeholder="Enter address" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}