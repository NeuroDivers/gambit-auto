
import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"

interface VehicleInfoSectionProps {
  form: UseFormReturn<any>
}

export function VehicleInfoSection({ form }: VehicleInfoSectionProps) {
  const vin = form.watch('vehicle_vin')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue('vehicle_make', vinData.make)
      if (vinData.model) form.setValue('vehicle_model', vinData.model)
      if (vinData.year) form.setValue('vehicle_year', vinData.year)
      if (vinData.bodyClass) form.setValue('vehicle_body_class', vinData.bodyClass)
      if (vinData.doors) form.setValue('vehicle_doors', vinData.doors)
      if (vinData.trim) form.setValue('vehicle_trim', vinData.trim)
      
      // Log what we're setting for debugging
      console.log('Setting VIN data:', {
        bodyClass: vinData.bodyClass,
        doors: vinData.doors,
        trim: vinData.trim
      })
    }
  }, [vinData, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicle_vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <div className="relative flex gap-2">
                    <Input placeholder="Enter VIN" {...field} className="flex-1" />
                    <VinScanner onScan={(scannedVin) => field.onChange(scannedVin)} />
                    {isLoadingVin && (
                      <Loader2 className="absolute right-12 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle_make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Toyota" {...field} />
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
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Camry" {...field} />
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
                      onChange={e => field.onChange(parseInt(e.target.value))}
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
            name="vehicle_body_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Type</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Sedan" {...field} />
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
            name="vehicle_doors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doors</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="e.g. 4" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
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
            name="vehicle_trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. LE" {...field} />
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
