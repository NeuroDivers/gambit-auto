
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Vehicle } from "@/components/clients/vehicles/types"
import { Loader2, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"

type VehicleInfoStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
}

export function VehicleInfoStep({ form }: VehicleInfoStepProps) {
  const [useNewVehicle, setUseNewVehicle] = useState(true)
  const [saveVehicle, setSaveVehicle] = useState(false)

  // Fetch client's vehicles
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['client-vehicles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!client) return []

      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('client_id', client.id)
        .order('is_primary', { ascending: false })

      return vehicles || []
    }
  })

  const handleVehicleSelect = (vehicleId: string) => {
    if (vehicleId === 'new') {
      setUseNewVehicle(true)
      return
    }

    const selectedVehicle = vehicles?.find(v => v.id === vehicleId)
    if (selectedVehicle) {
      form.setValue('vehicleInfo.make', selectedVehicle.make)
      form.setValue('vehicleInfo.model', selectedVehicle.model)
      form.setValue('vehicleInfo.year', selectedVehicle.year.toString())
      form.setValue('vehicleInfo.vin', selectedVehicle.vin || '')
      setUseNewVehicle(false)
    }
  }

  // Save new vehicle to client's vehicles if requested
  const saveNewVehicle = async () => {
    if (!saveVehicle) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!client) return

      const vehicleData = {
        client_id: client.id,
        make: form.getValues('vehicleInfo.make'),
        model: form.getValues('vehicleInfo.model'),
        year: parseInt(form.getValues('vehicleInfo.year')),
        vin: form.getValues('vehicleInfo.vin') || null,
        is_primary: !vehicles?.length // Set as primary if no other vehicles exist
      }

      await supabase.from('vehicles').insert(vehicleData)
    } catch (error) {
      console.error('Error saving vehicle:', error)
    }
  }

  // Add form submission handler for saving vehicle
  const originalSubmit = form.handleSubmit
  form.handleSubmit = (onValid: any) => {
    return originalSubmit(async (values: any) => {
      await saveNewVehicle()
      return onValid(values)
    })
  }

  return (
    <div className="space-y-4">
      {vehicles && vehicles.length > 0 && (
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={handleVehicleSelect}
            value={useNewVehicle ? 'new' : undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vehicle" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <>
                  {vehicles?.map((vehicle: Vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                      {vehicle.is_primary && " (Primary)"}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Vehicle
                    </div>
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {useNewVehicle && (
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
                    onChange={e => field.onChange(e.target.value)}
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

          {vehicles?.length === 0 ? (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Save as Primary Vehicle</FormLabel>
                <div className="text-sm text-muted-foreground">
                  This will be saved as your primary vehicle
                </div>
              </div>
              <Switch
                checked={saveVehicle}
                onCheckedChange={setSaveVehicle}
              />
            </FormItem>
          ) : (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Save Vehicle</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Add this vehicle to your saved vehicles
                </div>
              </div>
              <Switch
                checked={saveVehicle}
                onCheckedChange={setSaveVehicle}
              />
            </FormItem>
          )}
        </div>
      )}
    </div>
  )
}
