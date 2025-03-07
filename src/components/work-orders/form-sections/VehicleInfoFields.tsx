
import { useFormContext, UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { VinScanner } from "@/components/shared/VinScanner"
import { useVinLookup } from "@/hooks/useVinLookup"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { WorkOrderFormValues } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Vehicle } from "@/components/customers/vehicles/types"
import { Switch } from "@/components/ui/switch"

export function VehicleInfoFields({ form }: { form: UseFormReturn<WorkOrderFormValues> }) {
  const { watch, setValue } = form
  const customerId = watch("client_id") // Get the customer ID to fetch their vehicles
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)

  // Get VIN value for lookup
  const vin = watch("customer_vehicle_vin")

  // Fetch customer vehicles when the customer ID changes
  useEffect(() => {
    const fetchCustomerVehicles = async () => {
      if (!customerId) {
        setCustomerVehicles([]);
        return;
      }

      setIsLoadingVehicles(true);
      try {
        // Try to fetch using both client_id and customer_id for compatibility
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('*')
          .or(`customer_id.eq.${customerId}`)
          .order('is_primary', { ascending: false });

        if (error) throw error;
        
        if (vehicles && vehicles.length > 0) {
          setCustomerVehicles(vehicles as Vehicle[]);
        } else {
          setCustomerVehicles([]);
        }
      } catch (error) {
        console.error('Error fetching customer vehicles:', error);
        toast.error('Failed to load customer vehicles');
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchCustomerVehicles();
  }, [customerId]);

  // Handle vehicle selection from dropdown
  const handleVehicleSelect = (vehicleId: string) => {
    if (vehicleId === 'none') {
      // Clear vehicle fields if "None" is selected
      setValue("customer_vehicle_make", "");
      setValue("customer_vehicle_model", "");
      setValue("customer_vehicle_year", "");
      setValue("customer_vehicle_vin", "");
      setValue("customer_vehicle_color", "");
      setValue("customer_vehicle_trim", "");
      setValue("customer_vehicle_body_class", "");
      setValue("customer_vehicle_doors", "");
      setValue("customer_vehicle_license_plate", "");
      return;
    }

    // Find the selected vehicle
    const selectedVehicle = customerVehicles.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      // Populate form fields with vehicle data
      setValue("customer_vehicle_make", selectedVehicle.customer_vehicle_make || selectedVehicle.make || "");
      setValue("customer_vehicle_model", selectedVehicle.customer_vehicle_model || selectedVehicle.model || "");
      setValue("customer_vehicle_year", selectedVehicle.customer_vehicle_year?.toString() || selectedVehicle.year?.toString() || "");
      setValue("customer_vehicle_vin", selectedVehicle.customer_vehicle_vin || selectedVehicle.vin || "");
      setValue("customer_vehicle_color", selectedVehicle.customer_vehicle_color || selectedVehicle.color || "");
      setValue("customer_vehicle_trim", selectedVehicle.customer_vehicle_trim || selectedVehicle.trim || "");
      setValue("customer_vehicle_body_class", selectedVehicle.customer_vehicle_body_class || selectedVehicle.body_class || "");
      setValue("customer_vehicle_doors", selectedVehicle.customer_vehicle_doors?.toString() || selectedVehicle.doors?.toString() || "");
      setValue("customer_vehicle_license_plate", selectedVehicle.customer_vehicle_license_plate || selectedVehicle.license_plate || "");
    }
  };

  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setValue("customer_vehicle_make", vinData.make)
      if (vinData.model) setValue("customer_vehicle_model", vinData.model)
      if (vinData.year) setValue("customer_vehicle_year", vinData.year.toString())
      if (vinData.color) setValue("customer_vehicle_color", vinData.color)
      if (vinData.trim) setValue("customer_vehicle_trim", vinData.trim)
      if (vinData.bodyClass) setValue("customer_vehicle_body_class", vinData.bodyClass)
      if (vinData.doors) setValue("customer_vehicle_doors", vinData.doors.toString())
    }
  }, [vinData, setValue])

  return (
    <div className="space-y-6">
      {customerId && (
        <FormItem className="w-full">
          <FormLabel>Select Customer Vehicle</FormLabel>
          <Select onValueChange={handleVehicleSelect} defaultValue="none">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingVehicles ? "Loading vehicles..." : "Select a vehicle or enter manually"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None (enter manually)</SelectItem>
              {customerVehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.customer_vehicle_year || vehicle.year} {vehicle.customer_vehicle_make || vehicle.make} {vehicle.customer_vehicle_model || vehicle.model} {vehicle.is_primary ? "(Primary)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Select from customer's vehicles or enter details manually
          </p>
        </FormItem>
      )}

      {customerId && (
        <div className="flex items-center space-x-2 pb-2">
          <FormField
            control={form.control}
            name="save_vehicle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Save vehicle to customer profile</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}

      {form.watch("save_vehicle") && customerId && (
        <div className="flex items-center space-x-2 pb-2">
          <FormField
            control={form.control}
            name="is_primary_vehicle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Set as primary vehicle</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Make */}
        <FormField
          control={form.control}
          name="customer_vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="e.g. Toyota" {...field} disabled={isLoadingVin} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Model */}
        <FormField
          control={form.control}
          name="customer_vehicle_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="e.g. Camry" {...field} disabled={isLoadingVin} />
                  {isLoadingVin && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Year */}
        <FormField
          control={form.control}
          name="customer_vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={new Date().getFullYear().toString()}
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val);
                    }}
                    disabled={isLoadingVin}
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

        {/* VIN */}
        <FormField
          control={form.control}
          name="customer_vehicle_vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                VIN
                <span className="text-xs text-muted-foreground ml-2">(Optional - Auto-fills info)</span>
              </FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...field} />
                  <VinScanner onScan={(vin) => field.onChange(vin)} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color */}
        <FormField
          control={form.control}
          name="customer_vehicle_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Blue" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* License Plate */}
        <FormField
          control={form.control}
          name="customer_vehicle_license_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trim */}
        <FormField
          control={form.control}
          name="customer_vehicle_trim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trim</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. SE" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Body Class */}
        <FormField
          control={form.control}
          name="customer_vehicle_body_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Style</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Sedan" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Doors */}
        <FormField
          control={form.control}
          name="customer_vehicle_doors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doors</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 4"
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
