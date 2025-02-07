
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"

type VehicleInfoSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
}

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().min(1, "VIN is required"),
})

export function VehicleInfoSection({ form }: VehicleInfoSectionProps) {
  return (
    <div className="rounded-lg border border-white/10 p-6 bg-black/20">
      <h3 className="text-lg font-medium text-white/90 mb-4">Vehicle Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">Vehicle Make</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Toyota" 
                  className="bg-[#1A1F2C] border-zinc-800 text-white/90 placeholder:text-white/60"
                  {...field} 
                />
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
              <FormLabel className="text-white/90">Vehicle Model</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Camry" 
                  className="bg-[#1A1F2C] border-zinc-800 text-white/90 placeholder:text-white/60"
                  {...field} 
                />
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
              <FormLabel className="text-white/90">Vehicle Year</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  className="bg-[#1A1F2C] border-zinc-800 text-white/90"
                  {...field} 
                />
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
              <FormLabel className="text-white/90">Vehicle VIN</FormLabel>
              <FormControl>
                <Input 
                  className="bg-[#1A1F2C] border-zinc-800 text-white/90 placeholder:text-white/60"
                  placeholder="Enter VIN number"
                  {...field} 
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
