
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { WorkOrderFormValues } from "../types"
import { BarcodeScannerModal } from "@/components/shared/BarcodeScannerModal"
import { OCRScannerModal } from "@/components/shared/OCRScannerModal"

type VehicleInfoFieldsProps = {
  control: Control<WorkOrderFormValues>
  watch: UseFormWatch<WorkOrderFormValues>
  setValue: UseFormSetValue<WorkOrderFormValues>
  disabled?: boolean
}

export function VehicleInfoFields({ control, watch, setValue, disabled }: VehicleInfoFieldsProps) {
  const vin = watch('vehicle_serial')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setValue('vehicle_make', vinData.make)
      if (vinData.model) setValue('vehicle_model', vinData.model)
      if (vinData.year) setValue('vehicle_year', vinData.year)
    }
  }, [vinData, setValue])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Make</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Enter vehicle make" 
                    {...field}
                    autoComplete="off"
                    disabled={isLoadingVin || disabled}
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
              <FormLabel>Vehicle Model</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Enter vehicle model" 
                    {...field}
                    autoComplete="off"
                    disabled={isLoadingVin || disabled}
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
              <FormLabel>Vehicle Year</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="Enter vehicle year"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    autoComplete="off"
                    disabled={isLoadingVin || disabled}
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
                Vehicle VIN
                <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input 
                    placeholder="Enter vehicle VIN" 
                    {...field}
                    autoComplete="off"
                    disabled={disabled}
                  />
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
      </div>
    </div>
  )
}
