import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { WorkOrderFormFields } from "./WorkOrderFormFields"
import { WorkOrderFormValues, WorkOrderFormProps } from "./types"
import { useWorkOrderFormSubmission } from "./form-sections/useWorkOrderFormSubmission"

export function WorkOrderForm({ workOrder, onSuccess }: WorkOrderFormProps) {
  const form = useForm<WorkOrderFormValues>({
    defaultValues: {
      first_name: workOrder?.first_name || "",
      last_name: workOrder?.last_name || "",
      email: workOrder?.email || "",
      phone_number: workOrder?.phone_number || "",
      contact_preference: workOrder?.contact_preference || "email",
      vehicle_make: workOrder?.vehicle_make || "",
      vehicle_model: workOrder?.vehicle_model || "",
      vehicle_year: workOrder?.vehicle_year || undefined,
      vehicle_serial: workOrder?.vehicle_serial || "",
      additional_notes: workOrder?.additional_notes || "",
      timeframe: workOrder?.timeframe || "flexible",
      address: workOrder?.address || "",
      service_items: workOrder?.work_order_services?.map(service => ({
        service_id: service.service_id,
        service_name: service.service_types?.name || 'Unknown Service',
        quantity: service.quantity,
        unit_price: service.unit_price || 0
      })) || [],
      price: workOrder?.price || 0
    }
  })

  const { handleSubmit } = useWorkOrderFormSubmission({
    workOrder,
    mediaUrl: workOrder?.media_url || null,
    onSuccess
  })

  const { isSubmitting } = form.formState ?? {}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <WorkOrderFormFields form={form} />
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  )
}