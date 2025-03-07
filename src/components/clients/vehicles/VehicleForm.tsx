
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
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"

const formSchema = z.object({
  customer_vehicle_make: z.string().min(1, "Make is required"),
  customer_vehicle_model: z.string().min(1, "Model is required"),
  customer_vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  customer_vehicle_vin: z.string().optional(),
  customer_vehicle_color: z.string().optional(),
  customer_vehicle_license_plate: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false),
  customer_vehicle_body_class: z.string().optional(),
  customer_vehicle_doors: z.number().optional(),
  customer_vehicle_trim: z.string().optional()
})

interface VehicleFormProps {
  vehicle?: Vehicle
  clientId: string
  onSubmit: (values: VehicleFormValues) => Promise<void>
}

export function VehicleForm({ vehicle, clientId, onSubmit }: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle ? {
      customer_vehicle_make: vehicle.customer_vehicle_make,
      customer_vehicle_model: vehicle.customer_vehicle_model,
      customer_vehicle_year: vehicle.customer_vehicle_year,
      customer_vehicle_vin: vehicle.customer_vehicle_vin || "",
      customer_vehicle_color: vehicle.customer_vehicle_color || "",
      customer_vehicle_license_plate: vehicle.customer_vehicle_license_plate || "",
      notes: vehicle.notes || "",
      is_primary: vehicle.is_primary,
      customer_vehicle_body_class: vehicle.customer_vehicle_body_class || "",
      customer_vehicle_doors: vehicle.customer_vehicle_doors || undefined,
      customer_vehicle_trim: vehicle.customer_vehicle_trim || ""
    } : {
      customer_vehicle_make: "",
      customer_vehicle_model: "",
      customer_vehicle_year: new Date().getFullYear(),
      customer_vehicle_vin: "",
      customer_vehicle_color: "",
      customer_vehicle_license_plate: "",
      notes: "",
      is_primary: false,
      customer_vehicle_body_class: "",
      customer_vehicle_doors: undefined,
      customer_vehicle_trim: ""
    }
  })

  const vin = form.watch('customer_vehicle_vin')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue('customer_vehicle_make', vinData.make)
      if (vinData.model) form.setValue('customer_vehicle_model', vinData.model)
      if (vinData.year) form.setValue('customer_vehicle_year', vinData.year)
      if (vinData.color) form.setValue('customer_vehicle_color', vinData.color)
      if (vinData.bodyClass) form.setValue('customer_vehicle_body_class', vinData.bodyClass)
      if (vinData.doors) form.setValue('customer_vehicle_doors', vinData.doors)
      if (vinData.trim) form.setValue('customer_vehicle_trim', vinData.trim)
    }
  }, [vinData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_vehicle_make"
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
            name="customer_vehicle_model"
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
            name="customer_vehicle_year"
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
            name="customer_vehicle_vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  VIN
                  <span className="text-xs text-muted-foreground ml-2">(Optional - Auto-fills vehicle info)</span>
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

          <FormField
            control={form.control}
            name="customer_vehicle_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} placeholder="e.g. Blue" disabled={isLoadingVin} />
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
            name="customer_vehicle_license_plate"
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

          <FormField
            control={form.control}
            name="customer_vehicle_body_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Class</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Sedan" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_vehicle_doors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doors</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_vehicle_trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. LE, XLE" />
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
