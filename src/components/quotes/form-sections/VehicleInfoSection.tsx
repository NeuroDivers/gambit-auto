
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { BarcodeScannerModal } from "@/components/shared/BarcodeScannerModal"
import { OCRScannerModal } from "@/components/shared/OCRScannerModal"

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
    }
  }, [vinData, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VIN Section - Full Width */}
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
                <div className="space-y-2">
                  <Input {...field} placeholder="Enter VIN" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <BarcodeScannerModal onScan={(vin) => field.onChange(vin)} />
                    <OCRScannerModal onScan={(vin) => field.onChange(vin)} />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Make and Model Section */}
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

        {/* Year Section */}
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
        </div>
      </CardContent>
    </Card>
  )
}
