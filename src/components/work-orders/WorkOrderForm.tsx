import { Form } from "@/components/ui/form"
import { WorkOrderFormProps } from "./types"
import { useWorkOrderForm } from "./hooks/useWorkOrderForm"
import { FormSections } from "./form-sections/FormSections"

export function WorkOrderForm({ workOrder, onSuccess }: WorkOrderFormProps) {
  const { form, onSubmit } = useWorkOrderForm(workOrder, onSuccess)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSections 
          form={form}
          isSubmitting={form.formState.isSubmitting}
          isEditing={!!workOrder}
        />
      </form>
    </Form>
  )
}