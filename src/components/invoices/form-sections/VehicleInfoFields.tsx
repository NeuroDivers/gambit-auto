
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type VehicleInfoFieldsProps = {
  vehicleMake: string
  setVehicleMake: (value: string) => void
  vehicleModel: string
  setVehicleModel: (value: string) => void
  vehicleYear: number
  setVehicleYear: (value: number) => void
  vehicleVin: string
  setVehicleVin: (value: string) => void
  vehicleBodyClass: string
  setVehicleBodyClass: (value: string) => void
  vehicleDoors: number
  setVehicleDoors: (value: number) => void
  vehicleTrim: string
  setVehicleTrim: (value: string) => void
  customerId?: string | null
}

export function VehicleInfoFields({
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  vehicleBodyClass,
  setVehicleBodyClass,
  vehicleDoors,
  setVehicleDoors,
  vehicleTrim,
  setVehicleTrim,
  customerId
}: VehicleInfoFieldsProps) {
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vehicleVin)
  const currentYear = new Date().getFullYear()
  const [open, setOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["customer_vehicles", customerId],
    queryFn: async () => {
      if (!customerId) return []
      
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_primary", { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!customerId,
  })

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setVehicleMake(vinData.make)
      if (vinData.model) setVehicleModel(vinData.model)
      if (vinData.year) setVehicleYear(vinData.year)
      if (vinData.bodyClass) setVehicleBodyClass(vinData.bodyClass)
      if (vinData.doors) setVehicleDoors(vinData.doors)
      if (vinData.trim) setVehicleTrim(vinData.trim)
    }
  }, [vinData, setVehicleMake, setVehicleModel, setVehicleYear, setVehicleBodyClass, setVehicleDoors, setVehicleTrim])

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(e.target.value)
    if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= currentYear + 1) {
      setVehicleYear(yearValue)
    }
  }

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    
    const selectedVehicle = vehicles?.find(v => v.id === vehicleId)
    if (selectedVehicle) {
      setVehicleMake(selectedVehicle.make || "")
      setVehicleModel(selectedVehicle.model || "")
      setVehicleYear(selectedVehicle.year || currentYear)
      setVehicleVin(selectedVehicle.vin || "")
      if (selectedVehicle.body_class) setVehicleBodyClass(selectedVehicle.body_class)
      if (selectedVehicle.doors) setVehicleDoors(selectedVehicle.doors)
      if (selectedVehicle.trim) setVehicleTrim(selectedVehicle.trim)
    }
    
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {customerId && vehicles && vehicles.length > 0 && (
        <div>
          <Label>Select Customer Vehicle</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedVehicleId ? 
                  vehicles.find(v => v.id === selectedVehicleId)
                    ? `${vehicles.find(v => v.id === selectedVehicleId)?.year} ${vehicles.find(v => v.id === selectedVehicleId)?.make} ${vehicles.find(v => v.id === selectedVehicleId)?.model}`
                    : "Select a vehicle" 
                  : "Select a vehicle"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="max-h-[300px] overflow-y-auto">
                {isLoadingVehicles ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">Loading vehicles...</div>
                ) : vehicles.length === 0 ? (
                  <div className="py-6 text-center text-sm">No vehicles found for this customer.</div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        selectedVehicleId === vehicle.id ? "bg-accent text-accent-foreground" : "",
                        vehicle.is_primary ? "font-medium" : ""
                      )}
                      onClick={() => handleVehicleSelect(vehicle.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedVehicleId === vehicle.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ""}</span>
                        {vehicle.is_primary && <span className="text-xs text-primary">Primary Vehicle</span>}
                        {vehicle.vin && <span className="text-xs text-muted-foreground">VIN: {vehicle.vin}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div>
        <Label htmlFor="vehicleVin">
          VIN
          <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="vehicleVin"
            value={vehicleVin}
            onChange={(e) => setVehicleVin(e.target.value)}
            placeholder="Enter VIN for auto-fill"
            autoComplete="off"
          />
          <VinScanner onScan={(vin) => setVehicleVin(vin)} />
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleYear">Year</Label>
        <div className="relative">
          <Input
            id="vehicleYear"
            type="number"
            min={1900}
            max={currentYear + 1}
            value={vehicleYear || ''}
            onChange={handleYearChange}
            placeholder="Enter vehicle year"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleMake">Make</Label>
        <div className="relative">
          <Input
            id="vehicleMake"
            value={vehicleMake}
            onChange={(e) => setVehicleMake(e.target.value)}
            placeholder="Enter vehicle make"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleModel">Model</Label>
        <div className="relative">
          <Input
            id="vehicleModel"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="Enter vehicle model"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleBodyClass">Body Class</Label>
        <div className="relative">
          <Input
            id="vehicleBodyClass"
            value={vehicleBodyClass}
            onChange={(e) => setVehicleBodyClass(e.target.value)}
            placeholder="Enter body class"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleDoors">Number of Doors</Label>
        <div className="relative">
          <Input
            id="vehicleDoors"
            type="number"
            min={1}
            value={vehicleDoors || ''}
            onChange={(e) => setVehicleDoors(parseInt(e.target.value))}
            placeholder="Enter number of doors"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleTrim">Trim</Label>
        <div className="relative">
          <Input
            id="vehicleTrim"
            value={vehicleTrim}
            onChange={(e) => setVehicleTrim(e.target.value)}
            placeholder="Enter vehicle trim"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}
