
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "../types"

type PPFPackageFieldProps = {
  form: UseFormReturn<QuoteRequestFormData>
  serviceId: string
}

export function PPFPackageField({ form, serviceId }: PPFPackageFieldProps) {
  return (
    <FormField
      control={form.control}
      name={`service_details.${serviceId}.package_type`}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Package Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="partial_front" id={`${serviceId}-partial_front`} />
                <Label htmlFor={`${serviceId}-partial_front`}>Partial Front</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="full_front" id={`${serviceId}-full_front`} />
                <Label htmlFor={`${serviceId}-full_front`}>Full Front</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="track_pack" id={`${serviceId}-track_pack`} />
                <Label htmlFor={`${serviceId}-track_pack`}>Track Pack</Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="full_vehicle" id={`${serviceId}-full_vehicle`} />
                <Label htmlFor={`${serviceId}-full_vehicle`}>Full Vehicle</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

