
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "./types"
import { motion } from "framer-motion"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

type VehicleInfoStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
}

export function VehicleInfoStep({ form }: VehicleInfoStepProps) {
  const vin = form.watch('vehicle_vin')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue('vehicle_make', vinData.make)
      if (vinData.model) form.setValue('vehicle_model', vinData.model)
      if (vinData.year) form.setValue('vehicle_year', vinData.year.toString())
    }
  }, [vinData, form])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="quote_vehicle_make">Vehicle Make</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    id="quote_vehicle_make"
                    placeholder="e.g. Toyota" 
                    {...field}
                    autoComplete="off"
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
              <FormLabel htmlFor="quote_vehicle_model">Vehicle Model</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    id="quote_vehicle_model"
                    placeholder="e.g. Camry" 
                    {...field}
                    autoComplete="off"
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
          name="vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="quote_vehicle_year">Vehicle Year</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    id="quote_vehicle_year"
                    type="number" 
                    {...field}
                    autoComplete="off"
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
              <FormLabel htmlFor="quote_vehicle_vin">
                Vehicle VIN
                <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
              </FormLabel>
              <FormControl>
                <Input 
                  id="quote_vehicle_vin"
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  )
}
