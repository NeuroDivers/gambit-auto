import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { formSchema } from "../QuoteRequestFormFields"

type VehicleInfoFieldsProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
}

export function VehicleInfoFields({ form }: VehicleInfoFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Make</FormLabel>
              <FormControl>
                <Input placeholder="Toyota" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Model</FormLabel>
              <FormControl>
                <Input placeholder="Camry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2024"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="vehicle_serial"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vehicle Serial Number (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="VIN or Serial Number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}