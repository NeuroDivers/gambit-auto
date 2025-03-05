
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
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Year must be 1900 or later").max(new Date().getFullYear() + 1, "Year can't be in the future"),
  vin: z.string().optional(),
  color: z.string().optional(),
  license_plate: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false),
  body_class: z.string().optional(),
  doors: z.coerce.number().optional(),
  trim: z.string().optional(),
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
      make: vehicle?.make || "",
      model: vehicle?.model || "",
      year: vehicle?.year || new Date().getFullYear(),
      vin: vehicle?.vin || "",
      color: vehicle?.color || "",
      license_plate: vehicle?.license_plate || "",
      notes: vehicle?.notes || "",
      is_primary: vehicle?.is_primary || false,
      body_class: vehicle?.body_class || "",
      doors: vehicle?.doors || undefined,
      trim: vehicle?.trim || "",
    },
  });

  // VIN lookup integration
  const vin = form.watch("vin");
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin);

  // Autofill VIN data when available
  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue("make", vinData.make);
      if (vinData.model) form.setValue("model", vinData.model);
      if (vinData.year) form.setValue("year", vinData.year);
      if (vinData.bodyClass) form.setValue("body_class", vinData.bodyClass);
      if (vinData.doors) form.setValue("doors", vinData.doors);
      if (vinData.trim) form.setValue("trim", vinData.trim);
      if (vinData.color) form.setValue("color", vinData.color);
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
              name="vin"
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
                name="year"
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
                name="color"
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
                name="make"
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
                name="model"
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
              name="license_plate"
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
                name="trim"
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
                name="doors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doors</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Number of doors" 
                        {...field}
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="body_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Type</FormLabel>
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
                    <Textarea
                      placeholder="Additional notes about the vehicle"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Primary Vehicle</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Set as the customer's main vehicle
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : vehicle ? (
                  "Update Vehicle"
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
