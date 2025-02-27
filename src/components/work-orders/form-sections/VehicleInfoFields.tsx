
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface VehicleInfoFieldsProps {
  control: Control<WorkOrderFormValues>
  watch: UseFormWatch<WorkOrderFormValues>
  setValue: UseFormSetValue<WorkOrderFormValues>
}

export function VehicleInfoFields({ control, watch, setValue }: VehicleInfoFieldsProps) {
  const vin = watch("vehicle_serial")
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setValue("vehicle_make", vinData.make)
      if (vinData.model) setValue("vehicle_model", vinData.model)
      if (vinData.year) setValue("vehicle_year", vinData.year)
      if (vinData.bodyClass) setValue("vehicle_body_class", vinData.bodyClass)
      if (vinData.doors) setValue("vehicle_doors", vinData.doors)
      if (vinData.trim) setValue("vehicle_trim", vinData.trim)
    }
  }, [vinData, setValue])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="vehicle_serial"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VIN</FormLabel>
            <FormControl>
              <Input placeholder="Enter VIN for auto-fill" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                  placeholder="Enter vehicle year"
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
        control={control}
        name="vehicle_make"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Make</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Enter vehicle make" {...field} />
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
                <Input placeholder="Enter vehicle model" {...field} />
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
            <FormLabel>Body Class</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Enter body class" {...field} />
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
                  placeholder="Enter number of doors"
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
        control={control}
        name="vehicle_trim"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trim</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Enter vehicle trim" {...field} />
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
  )
}
