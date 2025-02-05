import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"

type VehicleInfoFieldsProps = {
  form: UseFormReturn<any>
}

export function VehicleInfoFields({ form }: VehicleInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="vehicle_make">Vehicle Make</FormLabel>
              <FormControl>
                <Input 
                  id="vehicle_make"
                  placeholder="Enter vehicle make" 
                  {...field} 
                />
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
              <FormLabel htmlFor="vehicle_model">Vehicle Model</FormLabel>
              <FormControl>
                <Input 
                  id="vehicle_model"
                  placeholder="Enter vehicle model" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="vehicle_year">Vehicle Year</FormLabel>
              <FormControl>
                <Input 
                  id="vehicle_year"
                  type="number" 
                  placeholder="Enter vehicle year"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
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
              <FormLabel htmlFor="vehicle_vin">Vehicle VIN</FormLabel>
              <FormControl>
                <Input 
                  id="vehicle_vin"
                  placeholder="Enter vehicle VIN" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}