
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
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
    }
  }, [vinData, form])

  // Handle VIN scanning result
  const handleVinScan = (scannedVin: string) => {
    form.setValue('vehicle_vin', scannedVin, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicle_make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      disabled={isLoadingVin}
                      placeholder="e.g. Toyota" 
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
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      disabled={isLoadingVin}
                      placeholder="e.g. Camry" 
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {...field}
                      disabled={isLoadingVin}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      min={1900}
                      max={new Date().getFullYear() + 1}
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
                <FormLabel>
                  VIN
                  <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} placeholder="Enter VIN" />
                    <VinScanner onScan={handleVinScan} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="vehicle_body_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Class</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      disabled={isLoadingVin}
                      placeholder="e.g. Sedan" 
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
            name="vehicle_doors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doors</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number"
                      {...field}
                      disabled={isLoadingVin}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      min={1}
                      max={6}
                      placeholder="e.g. 4" 
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
                    <Input 
                      {...field} 
                      disabled={isLoadingVin}
                      placeholder="e.g. LE" 
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
