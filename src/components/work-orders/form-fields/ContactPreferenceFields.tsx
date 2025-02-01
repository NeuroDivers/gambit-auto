import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"

type ContactPreferenceFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ContactPreferenceFields({ form }: ContactPreferenceFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="timeframe"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Preferred Timeframe</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="flexible" />
                </FormControl>
                <FormLabel className="font-normal">
                  Flexible
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="asap" />
                </FormControl>
                <FormLabel className="font-normal">
                  As Soon As Possible
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="within_week" />
                </FormControl>
                <FormLabel className="font-normal">
                  Within a Week
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="within_month" />
                </FormControl>
                <FormLabel className="font-normal">
                  Within a Month
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  )
}