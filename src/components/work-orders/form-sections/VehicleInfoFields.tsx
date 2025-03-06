
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { VinScanner } from "@/components/shared/VinScanner"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface VehicleInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function VehicleInfoFields({ form }: VehicleInfoFieldsProps) {
  const vin = form.watch('vehicle_vin')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  // Auto-fill vehicle information when VIN data is available
  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue('vehicle_make', vinData.make)
      if (vinData.model) form.setValue('vehicle_model', vinData.model)
      if (vinData.year) form.setValue('vehicle_year', vinData.year)
      if (vinData.color) form.setValue('vehicle_color', vinData.color)
      if (vinData.bodyClass) form.setValue('vehicle_body_class', vinData.bodyClass)
      if (vinData.doors) form.setValue('vehicle_doors', vinData.doors)
      if (vinData.trim) form.setValue('vehicle_trim', vinData.trim)
    }
  }, [vinData, form])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Vehicle Information</h3>
      
      <FormField
        control={form.control}
        name="vehicle_vin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              VIN
              <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input {...field} placeholder="Vehicle Identification Number" />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <VinScanner onScan={(vin) => field.onChange(vin)} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Toyota" />
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
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Camry" />
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
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || new Date().getFullYear())}
                  placeholder={new Date().getFullYear().toString()} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="vehicle_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Silver" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_trim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trim</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. XLE" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_license_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input {...field} placeholder="License plate number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vehicle_body_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Type</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Sedan, SUV" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_doors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doors</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || null)}
                  value={field.value || ''}
                  placeholder="Number of doors" 
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
