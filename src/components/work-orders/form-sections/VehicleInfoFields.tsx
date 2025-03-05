
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface VehicleInfoFieldsProps {
  control: Control<WorkOrderFormValues>
  watch: UseFormWatch<WorkOrderFormValues>
  setValue: UseFormSetValue<WorkOrderFormValues>
  customerId?: string | null
}

export function VehicleInfoFields({ control, watch, setValue, customerId }: VehicleInfoFieldsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [setPrimary, setSetPrimary] = useState(false)
  
  const vin = watch("vehicle_serial")
  const make = watch("vehicle_make")
  const model = watch("vehicle_model") 
  const year = watch("vehicle_year")
  
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setValue("vehicle_make", vinData.make)
      if (vinData.model) setValue("vehicle_model", vinData.model)
      if (vinData.year) setValue("vehicle_year", vinData.year)
      if (vinData.bodyClass) setValue("vehicle_body_class", vinData.bodyClass)
      if (vinData.doors) setValue("vehicle_doors", vinData.doors)
      if (vinData.trim) setValue("vehicle_trim", vinData.trim)
    }
  }, [vinData, setValue])

  const handleSaveVehicle = async () => {
    if (!customerId) {
      toast.error("Please select a customer before saving the vehicle")
      return
    }

    if (!make || !model || !year) {
      toast.error("Please enter at least make, model, and year to save a vehicle")
      return
    }

    setIsSaving(true)
    try {
      // If setting as primary, first unset any existing primary vehicles
      if (setPrimary) {
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('customer_id', customerId)
      }

      // Insert the new vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          customer_id: customerId,
          make,
          model,
          year,
          vin: vin || null,
          is_primary: setPrimary
        }])
        .select()
        .single()

      if (error) throw error

      toast.success(`Vehicle ${make} ${model} saved${setPrimary ? ' as primary' : ''}`)
    } catch (error: any) {
      console.error("Error saving vehicle:", error)
      toast.error(`Failed to save vehicle: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="vehicle_serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input placeholder="Enter VIN for auto-fill" {...field} className="flex-1" />
                  <VinScanner onScan={(scannedVin) => field.onChange(scannedVin)} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-12 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {/* FormMessage removed to not show validation errors since the field is now optional */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="Enter vehicle year"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Enter vehicle make" {...field} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Enter vehicle model" {...field} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_body_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Class</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Enter body class" {...field} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_doors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doors</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="Enter number of doors"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_trim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trim</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Enter vehicle trim" {...field} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {customerId && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="setPrimary"
              checked={setPrimary}
              onCheckedChange={setSetPrimary}
            />
            <label
              htmlFor="setPrimary"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as primary vehicle
            </label>
          </div>
          
          <Button 
            type="button" 
            className="w-full"
            onClick={handleSaveVehicle}
            disabled={isSaving || !make || !model || !year}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Vehicle...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Vehicle
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
