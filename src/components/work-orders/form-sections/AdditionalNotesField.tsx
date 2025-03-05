
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface AdditionalNotesFieldProps {
  form: UseFormReturn<WorkOrderFormValues>
  isEditing: boolean
}

export function AdditionalNotesField({ form, isEditing }: AdditionalNotesFieldProps) {
  const { control, watch, setValue } = form
  
  // Get the vehicle info to determine if this is a new vehicle or an existing one
  const vehicleMake = watch("vehicle_make")
  const vehicleModel = watch("vehicle_model")
  const vehicleYear = watch("vehicle_year")
  const vehicleSerial = watch("vehicle_serial")
  const clientId = watch("client_id")
  
  // Only show save vehicle option if there's a client selected and vehicle info entered
  const showSaveVehicleOption = !!clientId && 
    !!vehicleMake && 
    !!vehicleModel && 
    !!vehicleYear &&
    !isEditing

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any additional notes about the work order..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {showSaveVehicleOption && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="save-vehicle" className="cursor-pointer">
                  Save this vehicle to customer account
                </Label>
                <Switch
                  id="save-vehicle"
                  checked={!!form.watch("save_vehicle")}
                  onCheckedChange={(checked) => {
                    form.setValue("save_vehicle", checked);
                    
                    // If turning off save_vehicle, also turn off is_primary_vehicle
                    if (!checked) {
                      form.setValue("is_primary_vehicle", false);
                    }
                  }}
                />
              </div>
              
              {form.watch("save_vehicle") && (
                <div className="flex items-center justify-between ml-6">
                  <Label htmlFor="primary-vehicle" className="cursor-pointer">
                    Set as primary vehicle
                  </Label>
                  <Switch
                    id="primary-vehicle"
                    checked={!!form.watch("is_primary_vehicle")}
                    onCheckedChange={(checked) => form.setValue("is_primary_vehicle", checked)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
