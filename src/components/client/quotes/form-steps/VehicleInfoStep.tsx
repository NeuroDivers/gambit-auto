
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { VehicleSelector } from "./components/VehicleSelector"
import { NewVehicleForm } from "./components/NewVehicleForm"
import { useState } from "react"
import { useClientVehicles } from "./hooks/useClientVehicles"
import type { VehicleInfoStepProps } from "./types"

export function VehicleInfoStep({ form, onVehicleSave }: VehicleInfoStepProps) {
  const [useNewVehicle, setUseNewVehicle] = useState(true)
  const { data: vehicles, isLoading } = useClientVehicles()

  return (
    <div className="space-y-6">
      <VehicleSelector
        vehicles={vehicles}
        isLoading={isLoading}
        selectedVehicleId={useNewVehicle ? "new" : undefined}
        onVehicleSelect={(id) => setUseNewVehicle(id === "new")}
      />

      {useNewVehicle && (
        <NewVehicleForm
          onSave={async (data) => {
            form.setValue('vehicleInfo', {
              make: data.vehicle_make,
              model: data.vehicle_model,
              year: parseInt(data.vehicle_year),
              vin: data.vehicle_serial,
              saveToAccount: data.save_vehicle
            })
            if (data.save_vehicle && onVehicleSave) {
              await onVehicleSave(form.getValues('vehicleInfo'))
            }
          }}
          defaultValues={{
            vehicle_make: form.getValues('vehicleInfo.make'),
            vehicle_model: form.getValues('vehicleInfo.model'),
            vehicle_year: form.getValues('vehicleInfo.year')?.toString(),
            vehicle_serial: form.getValues('vehicleInfo.vin')
          }}
        />
      )}
    </div>
  )
}
