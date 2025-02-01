import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"

type TimeframeFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function TimeframeField({ form }: TimeframeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="timeframe"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Timeframe</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="asap">As Soon As Possible</SelectItem>
              <SelectItem value="within_week">Within a Week</SelectItem>
              <SelectItem value="within_month">Within a Month</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}