
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { useState } from "react"
import { useClientVehicles } from "./hooks/useClientVehicles"
import { VehicleSelector } from "./components/VehicleSelector"
import { NewVehicleForm } from "./components/NewVehicleForm"
import { toast } from "sonner"
import { useVehicles } from "@/components/clients/vehicles/hooks/useVehicles"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type VehicleInfoStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  saveVehicle?: boolean
}

export function VehicleInfoStep({ form, saveVehicle = true }: VehicleInfoStepProps) {
  const [useNewVehicle, setUseNewVehicle] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>()

  const { data: vehicles, isLoading } = useClientVehicles()

  // Get client ID for vehicle operations
  const { data: client } = useQuery({
    queryKey: ['client-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      return client
    }
  })

  const { addVehicle } = useVehicles(client?.id || '')

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)

    if (vehicleId === 'new') {
      setUseNewVehicle(true)
      form.setValue('vehicleInfo', {
        make: '',
        model: '',
        year: 0,
        vin: '',
        saveToAccount: false
      })
      return
    }

    const selectedVehicle = vehicles?.find(v => v.id === vehicleId)
    if (selectedVehicle) {
      form.setValue('vehicleInfo', {
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        year: selectedVehicle.year,
        vin: selectedVehicle.vin || '',
        saveToAccount: false
      })
      setUseNewVehicle(false)
    }
  }

  const handleSaveVehicle = async (data: any) => {
    try {
      // Update form values
      form.setValue('vehicleInfo', {
        make: data.vehicle_make,
        model: data.vehicle_model,
        year: parseInt(data.vehicle_year) || 0,
        vin: data.vehicle_serial,
        saveToAccount: data.save_vehicle
      }, { shouldValidate: true })

      // If saving to account, save the vehicle now
      if (data.save_vehicle && client?.id) {
        await addVehicle.mutateAsync({
          make: data.vehicle_make,
          model: data.vehicle_model,
          year: parseInt(data.vehicle_year) || 0,
          vin: data.vehicle_serial || undefined,
          is_primary: data.is_primary
        })
      }
    } catch (error) {
      console.error('Error handling vehicle data:', error)
      toast.error("Failed to process vehicle data")
    }
  }

  return (
    <div className="space-y-4">
      <VehicleSelector
        vehicles={vehicles}
        isLoading={isLoading}
        selectedVehicleId={selectedVehicleId}
        onVehicleSelect={handleVehicleSelect}
      />

      {useNewVehicle && (
        <NewVehicleForm
          onSave={handleSaveVehicle}
          onCancel={() => setUseNewVehicle(false)}
          defaultValues={{
            vehicle_make: form.getValues('vehicleInfo.make'),
            vehicle_model: form.getValues('vehicleInfo.model'),
            vehicle_year: form.getValues('vehicleInfo.year')?.toString() || '',
            vehicle_serial: form.getValues('vehicleInfo.vin')
          }}
        />
      )}
    </div>
  )
}
