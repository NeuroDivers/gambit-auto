
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { useState, useRef } from "react"
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
  const vehicleSaved = useRef(false)

  const { data: vehicles, isLoading, refetch } = useClientVehicles()

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    vehicleSaved.current = false // Reset saved state when selecting a new vehicle

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
      console.error('Error handling vehicle data:', error)
      toast.error("Failed to process vehicle data")
    }
  }

  const saveNewVehicle = async () => {
    if (!saveVehicle || !useNewVehicle || !saveToAccount || vehicleSaved.current) {
      console.log('Skipping vehicle save:', { 
        saveVehicle, 
        useNewVehicle, 
        saveToAccount, 
        alreadySaved: vehicleSaved.current 
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No authenticated user found')
        toast.error("Please sign in to save vehicles")
        return
      }

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!client) {
        console.error('No client found for user')
        toast.error("Client account not found")
        return
      }

      const yearValue = form.getValues('vehicleInfo.year')
      const make = form.getValues('vehicleInfo.make')
      const model = form.getValues('vehicleInfo.model')

      if (!make || !model || !yearValue) {
        console.error('Missing required vehicle information')
        toast.error("Please fill in all required vehicle information")
        return
      }

      const vehicleData = {
        client_id: client.id,
        make,
        model,
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
        vehicleSaved.current = true // Mark vehicle as saved
        toast.success("Vehicle saved to your account")
        await refetch() // Refresh the vehicles list
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error("Failed to save vehicle")
    }
  }

  // Wrap the form's submit handler to ensure vehicle saving happens before form submission
  const originalSubmit = form.handleSubmit
  form.handleSubmit = (onValid: any) => {
    return originalSubmit(async (values: any) => {
      if (saveToAccount && !vehicleSaved.current) {
        await saveNewVehicle()
      }
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
