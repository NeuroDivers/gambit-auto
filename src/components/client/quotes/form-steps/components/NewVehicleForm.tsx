
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, save_vehicle: saveVehicle })
  }

  const handleToggleChange = (checked: boolean) => {
    setSaveVehicle(checked)
    toast.info(checked ? "Vehicle will be saved to your account" : "Vehicle won't be saved to your account")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="save-vehicle"
            checked={saveVehicle}
            onCheckedChange={handleToggleChange}
          />
          <Label htmlFor="save-vehicle">Save vehicle to my account</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          Save
        </button>
      </div>
    </form>
  )
}
