import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { CustomerInfoFields } from "./form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "./form-sections/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ServiceItemType } from "./types"

const workOrderFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  contact_preference: z.enum(["phone", "email"]),
  address: z.string().optional(),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900, "Invalid year"),
  vehicle_serial: z.string().min(1, "Vehicle serial number is required"),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0)
  })).min(1, "At least one service is required"),
  sidekick_assignments: z.record(z.string(), z.string().optional()).optional(),
  additional_notes: z.string().optional(),
})

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>

export function CreateWorkOrderForm() {
  const { toast } = useToast()
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      service_items: [],
      sidekick_assignments: {},
      contact_preference: "email",
    },
  })

  const onSubmit = async (data: WorkOrderFormValues) => {
    try {
      // Insert work order
      const { data: workOrder, error: workOrderError } = await supabase
        .from("work_orders")
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          contact_preference: data.contact_preference,
          address: data.address,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_serial: data.vehicle_serial,
          additional_notes: data.additional_notes,
        })
        .select()
        .single()

      if (workOrderError) throw workOrderError

      // Insert work order services with sidekick assignments
      const { error: servicesError } = await supabase
        .from("work_order_services")
        .insert(
          data.service_items.map((item) => ({
            work_order_id: workOrder.id,
            service_id: item.service_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            assigned_sidekick_id: data.sidekick_assignments?.[item.service_id],
          }))
        )

      if (servicesError) throw servicesError

      toast({
        title: "Work order created",
        description: "Your work order has been submitted successfully.",
      })

      form.reset()
    } catch (error) {
      console.error("Error creating work order:", error)
      toast({
        title: "Error",
        description: "There was an error creating your work order. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <CustomerInfoFields form={form} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            <VehicleInfoFields form={form} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Services</h3>
            <ServiceSelectionField form={form} />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Submit Work Order
        </Button>
      </form>
    </Form>
  )
}