
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Vehicle, VehicleFormValues } from "./types"
import { useState } from "react"
import { useVehicles } from "./hooks/useVehicles"
import { toast } from "sonner"

interface VehicleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  vehicle?: Vehicle
}

const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  vin: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  license_plate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_primary: z.boolean().default(false),
  body_class: z.string().optional().nullable(),
  doors: z.number().optional().nullable(),
  trim: z.string().optional().nullable(),
})

export function VehicleFormDialog({ 
  open, 
  onOpenChange, 
  customerId, 
  vehicle 
}: VehicleFormDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const { addVehicle, updateVehicle } = useVehicles(customerId)
  const isEditing = !!vehicle

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
      doors: vehicle?.doors || null,
      trim: vehicle?.trim || "",
    },
  })

  const onSubmit = async (values: VehicleFormValues) => {
    setIsPending(true)
    
    try {
      if (isEditing && vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, values })
      } else {
        await addVehicle.mutateAsync(values)
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving vehicle:", error)
      toast.error("Failed to save vehicle")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle make" {...field} />
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
                      <Input placeholder="Vehicle model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Vehicle year" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
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
                      <Input placeholder="Vehicle color" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle VIN" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="license_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl>
                      <Input placeholder="License plate" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="body_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Body type" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trim</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle trim" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="doors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Doors</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Number of doors" 
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
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
                    <Input placeholder="Additional notes" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Primary Vehicle</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this the primary vehicle for the customer
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
