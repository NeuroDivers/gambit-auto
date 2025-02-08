
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "../types"

type WindowTintFieldProps = {
  form: UseFormReturn<QuoteRequestFormData>
  serviceId: string
}

export function WindowTintField({ form, serviceId }: WindowTintFieldProps) {
  return (
    <FormField
      control={form.control}
      name={`service_details.${serviceId}.tint_type`}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Tint Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="two_front" id={`${serviceId}-two_front`} />
                <Label htmlFor={`${serviceId}-two_front`}>2 Front Windows</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="front_and_rear" id={`${serviceId}-front_and_rear`} />
                <Label htmlFor={`${serviceId}-front_and_rear`}>Front and Rear Windows</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="complete" id={`${serviceId}-complete`} />
                <Label htmlFor={`${serviceId}-complete`}>Complete</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

