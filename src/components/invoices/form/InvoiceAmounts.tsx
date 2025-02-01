import { Control } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type InvoiceAmountsProps = {
  control: Control<any>
}

export function InvoiceAmounts({ control }: InvoiceAmountsProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <FormField
        control={control}
        name="subtotal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtotal</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tax_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax Amount</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="total"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}