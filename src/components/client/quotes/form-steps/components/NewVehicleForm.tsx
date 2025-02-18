
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"

type NewVehicleFormProps = {
  form: UseFormReturn<QuoteRequestFormData>
  saveVehicle: boolean
  onSaveVehicleChange: (checked: boolean) => void
  hasExistingVehicles: boolean
}

export function NewVehicleForm({ 
  form, 
  saveVehicle, 
  onSaveVehicleChange,
  hasExistingVehicles 
}: NewVehicleFormProps) {
  return (
    <div className="space-y-4">
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
                onChange={e => field.onChange(Number(e.target.value))}
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

      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Save Vehicle</FormLabel>
          <div className="text-sm text-muted-foreground">
            {!hasExistingVehicles ? 'This will be saved as your primary vehicle' : 'Add this vehicle to your saved vehicles'}
          </div>
        </div>
        <Switch
          checked={saveVehicle}
          onCheckedChange={onSaveVehicleChange}
        />
      </FormItem>
    </div>
  )
}
