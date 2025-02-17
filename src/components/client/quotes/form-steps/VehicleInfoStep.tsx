
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { ServiceTypeSelection } from "./ServiceTypeSelection"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type VehicleInfoStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
}

export function VehicleInfoStep({ form }: VehicleInfoStepProps) {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
        .order("sort_order", { ascending: true })
      
      if (error) throw error
      return data
    }
  })

  const selectedServices = form.watch("service_items") || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vehicleInfo.make"
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
          name="vehicleInfo.model"
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
          name="vehicleInfo.year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  placeholder="e.g. 2020" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicleInfo.vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vehicle Identification Number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel>Select Services</FormLabel>
        <div className="mt-2">
          <ServiceTypeSelection
            services={services || []}
            selectedServices={selectedServices}
            onServicesChange={(services) => form.setValue('service_items', services)}
          />
        </div>
        <FormMessage>
          {selectedServices.length === 0 && "Please select at least one service"}
        </FormMessage>
      </div>
    </div>
  )
}
