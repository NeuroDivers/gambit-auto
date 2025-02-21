
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { useVinLookup } from "@/hooks/useVinLookup"

interface VehicleFormData {
  vehicle_make: string
  vehicle_model: string
  vehicle_year: string
  vehicle_serial: string
}

interface NewVehicleFormProps {
  onSave: (data: VehicleFormData & { save_vehicle: boolean }) => void
  onCancel: () => void
  defaultValues?: Partial<VehicleFormData>
}

export function NewVehicleForm({ onSave, onCancel, defaultValues }: NewVehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicle_make: defaultValues?.vehicle_make || "",
    vehicle_model: defaultValues?.vehicle_model || "",
    vehicle_year: defaultValues?.vehicle_year || "",
    vehicle_serial: defaultValues?.vehicle_serial || "",
  })

  const [saveVehicle, setSaveVehicle] = useState(false)

  // Use VIN lookup hook
  const { data: vinData, isLoading: isLookingUpVin } = useVinLookup(formData.vehicle_serial)

  // Update form data when default values change
  useEffect(() => {
    setFormData({
      vehicle_make: defaultValues?.vehicle_make || "",
      vehicle_model: defaultValues?.vehicle_model || "",
      vehicle_year: defaultValues?.vehicle_year || "",
      vehicle_serial: defaultValues?.vehicle_serial || "",
    })
  }, [defaultValues])

  // Update form when VIN data is received
  useEffect(() => {
    if (vinData && !vinData.error && vinData.make && vinData.model && vinData.year) {
      const newData = {
        ...formData,
        vehicle_make: vinData.make,
        vehicle_model: vinData.model,
        vehicle_year: vinData.year.toString(),
      }
      setFormData(newData)
      onSave({ ...newData, save_vehicle: saveVehicle })
    }
  }, [vinData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      // Just update the parent's form state without saving
      onSave({ ...newData, save_vehicle: saveVehicle })
      return newData
    })
  }

  const handleSaveToggleChange = (checked: boolean) => {
    setSaveVehicle(checked)
    onSave({ ...formData, save_vehicle: checked })
  }

  return (
    <form className="space-y-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_make">Make</Label>
            <Input
              id="vehicle_make"
              name="vehicle_make"
              value={formData.vehicle_make}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_model">Model</Label>
            <Input
              id="vehicle_model"
              name="vehicle_model"
              value={formData.vehicle_model}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_year">Year</Label>
            <Input
              id="vehicle_year"
              name="vehicle_year"
              value={formData.vehicle_year}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_serial">VIN</Label>
            <Input
              id="vehicle_serial"
              name="vehicle_serial"
              value={formData.vehicle_serial}
              onChange={handleInputChange}
              placeholder="Enter your VIN number"
              className={isLookingUpVin ? "bg-muted" : ""}
            />
            <p className="text-sm text-muted-foreground">
              {isLookingUpVin ? "Looking up VIN..." : 
                "Enter your vehicle's 17-character VIN to automatically fill make, model, and year"}
            </p>
            {vinData?.error && (
              <p className="text-sm text-destructive">
                {vinData.error}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="save-vehicle"
            checked={saveVehicle}
            onCheckedChange={handleSaveToggleChange}
          />
          <Label htmlFor="save-vehicle">Save vehicle to my account</Label>
        </div>
      </div>
    </form>
  )
}
