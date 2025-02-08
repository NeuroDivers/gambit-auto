
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "../types"

type AutoDetailingFieldProps = {
  form: UseFormReturn<QuoteRequestFormData>
  serviceId: string
}

export function AutoDetailingField({ form, serviceId }: AutoDetailingFieldProps) {
  return (
    <FormField
      control={form.control}
      name={`service_details.${serviceId}.detail_type`}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Detail Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="interior" id={`${serviceId}-interior`} />
                <Label htmlFor={`${serviceId}-interior`}>Interior</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="exterior" id={`${serviceId}-exterior`} />
                <Label htmlFor={`${serviceId}-exterior`}>Exterior</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="both" id={`${serviceId}-both`} />
                <Label htmlFor={`${serviceId}-both`}>Both Interior & Exterior</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

