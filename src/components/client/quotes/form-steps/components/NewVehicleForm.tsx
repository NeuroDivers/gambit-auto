
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface VehicleFormData {
  vehicle_make: string
  vehicle_model: string
  vehicle_year: string
  vehicle_serial: string
}

interface NewVehicleFormProps {
  onSave: (data: VehicleFormData & { save_vehicle: boolean, is_primary: boolean }) => void
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
  const [isPrimary, setIsPrimary] = useState(false)

  // Update form data when default values change
  useEffect(() => {
    setFormData({
      vehicle_make: defaultValues?.vehicle_make || "",
      vehicle_model: defaultValues?.vehicle_model || "",
      vehicle_year: defaultValues?.vehicle_year || "",
      vehicle_serial: defaultValues?.vehicle_serial || "",
    })
  }, [defaultValues])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      // Immediately notify parent of changes
      onSave({ ...newData, save_vehicle: saveVehicle, is_primary: isPrimary })
      return newData
    })
  }

  const handleSaveToggleChange = (checked: boolean) => {
    setSaveVehicle(checked)
    if (!checked) {
      setIsPrimary(false)
    }
    toast.info(checked ? "Vehicle will be saved to your account" : "Vehicle won't be saved to your account")
    // Update parent with current data and new save preference
    onSave({ ...formData, save_vehicle: checked, is_primary: checked ? isPrimary : false })
  }

  const handlePrimaryToggleChange = (checked: boolean) => {
    setIsPrimary(checked)
    toast.info(checked ? "Vehicle will be set as primary" : "Vehicle won't be set as primary")
    // Update parent with current data and new primary preference
    onSave({ ...formData, save_vehicle: saveVehicle, is_primary: checked })
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
            <Label htmlFor="vehicle_serial">VIN (Optional)</Label>
            <Input
              id="vehicle_serial"
              name="vehicle_serial"
              value={formData.vehicle_serial}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="save-vehicle"
              checked={saveVehicle}
              onCheckedChange={handleSaveToggleChange}
            />
            <Label htmlFor="save-vehicle">Save vehicle to my account</Label>
          </div>
          {saveVehicle && (
            <div className="flex items-center space-x-2">
              <Switch
                id="primary-vehicle"
                checked={isPrimary}
                onCheckedChange={handlePrimaryToggleChange}
              />
              <Label htmlFor="primary-vehicle">Set as primary vehicle</Label>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
