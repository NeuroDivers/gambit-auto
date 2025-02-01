import { Control } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type InvoiceBasicInfoProps = {
  control: Control<any>
}

export function InvoiceBasicInfo({ control }: InvoiceBasicInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <FormField
        control={control}
        name="invoice_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Number</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="due_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}