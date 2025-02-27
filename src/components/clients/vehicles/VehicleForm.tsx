
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Textarea } from "../../ui/textarea"
import { Vehicle, VehicleFormValues } from "./types"
import { Switch } from "../../ui/switch"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"

const formSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  color: z.string().optional(),
  license_plate: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false)
})

interface VehicleFormProps {
  vehicle?: Vehicle
  clientId: string
  onSubmit: (values: VehicleFormValues) => Promise<void>
}

export function VehicleForm({ vehicle, clientId, onSubmit }: VehicleFormProps) {
  const [scannerActive, setScannerActive] = useState(false);
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle ? {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin || "",
      color: vehicle.color || "",
      license_plate: vehicle.license_plate || "",
      notes: vehicle.notes || "",
      is_primary: vehicle.is_primary
    } : {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      color: "",
      license_plate: "",
      notes: "",
      is_primary: false
    }
  })

  const vin = form.watch('vin')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue('make', vinData.make)
      if (vinData.model) form.setValue('model', vinData.model)
      if (vinData.year) form.setValue('year', vinData.year)
    }
  }, [vinData, form])
  
  const handleScan = (vin: string) => {
    form.setValue('vin', vin);
    setScannerActive(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
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
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g. Camry" {...field} disabled={isLoadingVin} />
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
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
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
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  VIN
                  <span className="text-xs text-muted-foreground ml-2">(Optional - Auto-fills vehicle info)</span>
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} />
                    <VinScanner 
                      onScan={handleScan} 
                      isActive={scannerActive}
                      scanMode="text"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="license_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_primary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Primary Vehicle</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this the primary vehicle for this client
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {vehicle ? "Update Vehicle" : "Add Vehicle"}
        </Button>
      </form>
    </Form>
  )
}
