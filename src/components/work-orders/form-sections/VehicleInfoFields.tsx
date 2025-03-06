
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"

interface VehicleInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isEditing?: boolean
  customerId?: string | null
}

export function VehicleInfoFields({ form, isEditing, customerId }: VehicleInfoFieldsProps) {
  const { control, watch, setValue } = form
  
  // Watch VIN for auto-fill functionality
  const vin = watch('vehicle_serial')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)
  
  // Auto-fill vehicle information when VIN data is available
  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setValue('vehicle_make', vinData.make)
      if (vinData.model) setValue('vehicle_model', vinData.model)
      if (vinData.year) setValue('vehicle_year', vinData.year)
      // Set additional vehicle fields if they are added to the form
      if (vinData.bodyClass) setValue('vehicle_body_class', vinData.bodyClass)
      if (vinData.doors) setValue('vehicle_doors', vinData.doors)
      if (vinData.trim) setValue('vehicle_trim', vinData.trim)
    }
  }, [vinData, setValue])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="vehicle_serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Vehicle Identification Number" 
                      {...field} 
                      disabled={isLoadingVin}
                    />
                    {isLoadingVin && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <VinScanner onScan={(scannedVin) => field.onChange(scannedVin)} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter VIN to auto-fill vehicle details
                </p>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="vehicle_make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. Toyota" 
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
            control={control}
            name="vehicle_model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. Corolla" 
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
            control={control}
            name="vehicle_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="e.g. 2022" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : '';
                        field.onChange(value);
                      }}
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
            control={control}
            name="vehicle_trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. LE, XLE" 
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
            control={control}
            name="vehicle_body_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Type</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. Sedan, SUV" 
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
            control={control}
            name="vehicle_doors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doors</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="e.g. 4" 
                      value={field.value || ''} 
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        field.onChange(value);
                      }}
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
      </CardContent>
    </Card>
  )
}
