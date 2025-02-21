
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useClientVehicles } from "./hooks/useClientVehicles"
import { VehicleSelector } from "./components/VehicleSelector"
import { NewVehicleForm } from "./components/NewVehicleForm"

type VehicleInfoStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  saveVehicle?: boolean
}

export function VehicleInfoStep({ form, saveVehicle = true }: VehicleInfoStepProps) {
  const [useNewVehicle, setUseNewVehicle] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>()

  const { data: vehicles, isLoading } = useClientVehicles()

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)

    if (vehicleId === 'new') {
      setUseNewVehicle(true)
      form.setValue('vehicleInfo.make', '')
      form.setValue('vehicleInfo.model', '')
      form.setValue('vehicleInfo.year', 0)
      form.setValue('vehicleInfo.vin', '')
      return
    }

    const selectedVehicle = vehicles?.find(v => v.id === vehicleId)
    if (selectedVehicle) {
      form.setValue('vehicleInfo.make', selectedVehicle.make)
      form.setValue('vehicleInfo.model', selectedVehicle.model)
      form.setValue('vehicleInfo.year', selectedVehicle.year)
      form.setValue('vehicleInfo.vin', selectedVehicle.vin || '')
      setUseNewVehicle(false)
    }
  }

  const handleSaveVehicle = async (data: any) => {
    try {
      form.setValue('vehicleInfo.make', data.vehicle_make)
      form.setValue('vehicleInfo.model', data.vehicle_model)
      form.setValue('vehicleInfo.year', parseInt(data.vehicle_year))
      form.setValue('vehicleInfo.vin', data.vehicle_serial)
    } catch (error) {
      console.error('Error saving vehicle data:', error)
    }
  }

  const saveNewVehicle = async () => {
    if (!saveVehicle || !useNewVehicle) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!client) return

      const yearValue = form.getValues('vehicleInfo.year')
      const vehicleData = {
        client_id: client.id,
        make: form.getValues('vehicleInfo.make'),
        model: form.getValues('vehicleInfo.model'),
        year: typeof yearValue === 'string' ? parseInt(yearValue) : yearValue,
        vin: form.getValues('vehicleInfo.vin') || null,
        is_primary: !vehicles?.length
      }

      await supabase.from('vehicles').insert(vehicleData)
    } catch (error) {
      console.error('Error saving vehicle:', error)
    }
  }

  const originalSubmit = form.handleSubmit
  form.handleSubmit = (onValid: any) => {
    return originalSubmit(async (values: any) => {
      await saveNewVehicle()
      return onValid(values)
    })
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
