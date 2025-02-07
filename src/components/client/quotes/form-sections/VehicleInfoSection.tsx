
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"

type VehicleInfoSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
}

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().min(1, "VIN is required"),
})

export function VehicleInfoSection({ form }: VehicleInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="vehicle_make"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vehicle Make</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Toyota" {...field} />
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
              <Input placeholder="e.g. Camry" {...field} />
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
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="vehicle_vin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vehicle VIN</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
