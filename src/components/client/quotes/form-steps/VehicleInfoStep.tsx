
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useClientVehicles } from "./hooks/useClientVehicles"
import { VehicleSelector } from "./components/VehicleSelector"
import { NewVehicleForm } from "./components/NewVehicleForm"
import { toast } from "sonner"

type VehicleInfoStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  saveVehicle?: boolean
}

export function VehicleInfoStep({ form, saveVehicle = true }: VehicleInfoStepProps) {
  const [useNewVehicle, setUseNewVehicle] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>()
  const [saveToAccount, setSaveToAccount] = useState(false)

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
      // Immediately update form values when the vehicle form changes
      form.setValue('vehicleInfo.make', data.vehicle_make, { shouldValidate: true })
      form.setValue('vehicleInfo.model', data.vehicle_model, { shouldValidate: true })
      form.setValue('vehicleInfo.year', parseInt(data.vehicle_year) || 0, { shouldValidate: true })
      form.setValue('vehicleInfo.vin', data.vehicle_serial, { shouldValidate: true })
      setSaveToAccount(data.save_vehicle)
    } catch (error) {
      console.error('Error saving vehicle data:', error)
    }
  }

  const saveNewVehicle = async () => {
    if (!saveVehicle || !useNewVehicle || !saveToAccount) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No authenticated user found')
        return
      }

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!client) {
        console.error('No client found for user')
        return
      }

      const yearValue = form.getValues('vehicleInfo.year')
      const vehicleData = {
        client_id: client.id,
        make: form.getValues('vehicleInfo.make'),
        model: form.getValues('vehicleInfo.model'),
        year: typeof yearValue === 'string' ? parseInt(yearValue) : yearValue,
        vin: form.getValues('vehicleInfo.vin') || null,
        is_primary: !vehicles?.length
      }

      console.log('Saving vehicle to database:', vehicleData)
      const { error: saveError } = await supabase
        .from('vehicles')
        .insert([vehicleData])
      
      if (saveError) {
        console.error('Error saving vehicle:', saveError)
        toast.error("Failed to save vehicle")
      } else {
        toast.success("Vehicle saved to your account")
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error("Failed to save vehicle")
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
