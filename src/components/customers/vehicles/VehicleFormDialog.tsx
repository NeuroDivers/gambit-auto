
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Vehicle, VehicleFormValues } from "./types";
import { useVehicles } from "./hooks/useVehicles";
import { useVinLookup } from "@/hooks/useVinLookup";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const vehicleFormSchema = z.object({
  customer_vehicle_make: z.string().min(1, "Make is required"),
  customer_vehicle_model: z.string().min(1, "Model is required"),
  customer_vehicle_year: z.coerce.number().min(1900, "Year must be 1900 or later").max(new Date().getFullYear() + 1, "Year can't be in the future"),
  customer_vehicle_vin: z.string().optional(),
  customer_vehicle_color: z.string().optional(),
  customer_vehicle_license_plate: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false),
  customer_vehicle_body_class: z.string().optional(),
  customer_vehicle_doors: z.coerce.number().optional(),
  customer_vehicle_trim: z.string().optional(),
});

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  vehicle?: Vehicle;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  customerId,
  vehicle,
}: VehicleFormDialogProps) {
  const { addVehicle, updateVehicle } = useVehicles(customerId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      customer_vehicle_make: vehicle?.customer_vehicle_make || "",
      customer_vehicle_model: vehicle?.customer_vehicle_model || "",
      customer_vehicle_year: vehicle?.customer_vehicle_year || new Date().getFullYear(),
      customer_vehicle_vin: vehicle?.customer_vehicle_vin || "",
      customer_vehicle_color: vehicle?.customer_vehicle_color || "",
      customer_vehicle_license_plate: vehicle?.customer_vehicle_license_plate || "",
      notes: vehicle?.notes || "",
      is_primary: vehicle?.is_primary || false,
      customer_vehicle_body_class: vehicle?.customer_vehicle_body_class || "",
      customer_vehicle_doors: vehicle?.customer_vehicle_doors || undefined,
      customer_vehicle_trim: vehicle?.customer_vehicle_trim || "",
    },
  });

  // VIN lookup integration
  const vin = form.watch("customer_vehicle_vin");
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin);

  // Autofill VIN data when available
  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue("customer_vehicle_make", vinData.make);
      if (vinData.model) form.setValue("customer_vehicle_model", vinData.model);
      if (vinData.year) form.setValue("customer_vehicle_year", vinData.year);
      if (vinData.bodyClass) form.setValue("customer_vehicle_body_class", vinData.bodyClass);
      if (vinData.doors) form.setValue("customer_vehicle_doors", vinData.doors);
      if (vinData.trim) form.setValue("customer_vehicle_trim", vinData.trim);
      if (vinData.color) form.setValue("customer_vehicle_color", vinData.color);
    }
  }, [vinData, form]);

  const onSubmit = async (values: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, values });
      } else {
        await addVehicle.mutateAsync(values);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          <DialogDescription>
            {vehicle
              ? "Update this vehicle's information."
              : "Enter details about the customer's vehicle."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_vehicle_vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter VIN for auto-fill" {...field} />
                      {isLoadingVin && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_vehicle_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_vehicle_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_vehicle_make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_vehicle_license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input placeholder="License plate number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_vehicle_trim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trim</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. LE, XLE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_vehicle_doors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doors</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_vehicle_body_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Class</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sedan, SUV" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about this vehicle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      id="primary-vehicle"
                    />
                  </FormControl>
                  <div>
                    <FormLabel htmlFor="primary-vehicle" className="text-sm font-medium">
                      Set as primary vehicle
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {vehicle ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  vehicle ? "Update Vehicle" : "Save Vehicle"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
