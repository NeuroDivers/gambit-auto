
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { VinScanner } from "@/components/shared/VinScanner"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface VehicleInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isEditing: boolean
  customerId: string | null
}

export function VehicleInfoFields({ form, isEditing, customerId }: VehicleInfoFieldsProps) {
  const { control, watch } = form
  
  // Set up VIN lookup
  const vin = watch('vehicle_serial')
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
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="vehicle_make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Toyota" {...field} disabled={isLoadingVin} />
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
                    <Input placeholder="e.g. Corolla" {...field} disabled={isLoadingVin} />
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
            name="vehicle_serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  VIN
                  <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} />
                    <VinScanner onScan={(vin) => field.onChange(vin)} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* New fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="vehicle_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Red" {...field} disabled={isLoadingVin} />
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
            name="vehicle_license_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ABC123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="vehicle_trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. XLE, Limited" {...field} disabled={isLoadingVin} />
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
            name="vehicle_body_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Type</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Sedan, SUV" {...field} disabled={isLoadingVin} />
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
        
        <FormField
          control={control}
          name="vehicle_doors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Doors</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="e.g. 4" 
                    {...field} 
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
        
        {customerId && (
          <FormField
            control={control}
            name="save_vehicle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Save to Customer Account</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Save this vehicle to the customer's account for future work orders
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {customerId && (
          <FormField
            control={control}
            name="is_primary_vehicle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Primary Vehicle</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Mark this as the customer's primary vehicle
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
