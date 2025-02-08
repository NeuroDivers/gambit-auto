
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { Loader2 } from "lucide-react"

type VehicleInfoFieldsProps = {
  form: UseFormReturn<any>
  isLoadingVin?: boolean
  vinAutoFillEnabled?: boolean
}

export function VehicleInfoFields({ form, isLoadingVin, vinAutoFillEnabled }: VehicleInfoFieldsProps) {
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
                <div className="relative">
                  <Input 
                    id="vehicle_make"
                    name="vehicle_make"
                    placeholder="Enter vehicle make" 
                    {...field} 
                    disabled={isLoadingVin}
                  />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
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
                <div className="relative">
                  <Input 
                    id="vehicle_model"
                    name="vehicle_model"
                    placeholder="Enter vehicle model" 
                    {...field} 
                    disabled={isLoadingVin}
                  />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
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
                <div className="relative">
                  <Input 
                    id="vehicle_year"
                    name="vehicle_year"
                    type="number" 
                    placeholder="Enter vehicle year"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    disabled={isLoadingVin}
                  />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
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
              <FormLabel htmlFor="vehicle_vin">
                Vehicle VIN
                {vinAutoFillEnabled && (
                  <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
                )}
              </FormLabel>
              <FormControl>
                <Input 
                  id="vehicle_vin"
                  name="vehicle_vin"
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
