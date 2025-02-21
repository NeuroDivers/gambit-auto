
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { useState } from "react"
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
      // Update form values
      const vehicleInfo = form.getValues('vehicleInfo')
      form.setValue('vehicleInfo', {
        ...vehicleInfo,
        make: data.vehicle_make,
        model: data.vehicle_model,
        year: parseInt(data.vehicle_year) || 0,
        vin: data.vehicle_serial,
        saveToAccount: data.save_vehicle
      }, { shouldValidate: true })
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
