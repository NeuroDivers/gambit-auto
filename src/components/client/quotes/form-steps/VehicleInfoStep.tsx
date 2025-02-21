
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

// Extend the form type to include our custom function
type ExtendedFormType = UseFormReturn<QuoteRequestFormData> & {
  saveVehicleToAccount?: () => Promise<void>
}

type VehicleInfoStepProps = {
  form: ExtendedFormType
  saveVehicle?: boolean
}

export function VehicleInfoStep({ form, saveVehicle = true }: VehicleInfoStepProps) {
  const [useNewVehicle, setUseNewVehicle] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>()
  const [pendingVehicleData, setPendingVehicleData] = useState<any>(null)

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
    // Update form values
    form.setValue('vehicleInfo', {
      make: data.vehicle_make,
      model: data.vehicle_model,
      year: parseInt(data.vehicle_year) || 0,
      vin: data.vehicle_serial,
      saveToAccount: data.save_vehicle
    }, { shouldValidate: true })

    // Store the vehicle data to be saved when the form is submitted
    setPendingVehicleData(data)
  }

  // This function will be called by the parent component when the form is actually submitted
  const saveVehicleToAccount = async () => {
    if (!pendingVehicleData?.save_vehicle || !client?.id) return

    try {
      await addVehicle.mutateAsync({
        make: pendingVehicleData.vehicle_make,
        model: pendingVehicleData.vehicle_model,
        year: parseInt(pendingVehicleData.vehicle_year) || 0,
        vin: pendingVehicleData.vehicle_serial || undefined
      })
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error("Failed to save vehicle to your account")
    }
  }

  // Expose the saveVehicleToAccount function to the parent form
  ;(form as ExtendedFormType).saveVehicleToAccount = saveVehicleToAccount

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
