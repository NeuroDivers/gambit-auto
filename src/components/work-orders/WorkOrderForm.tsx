import { Form } from "@/components/ui/form"
import { WorkOrderFormProps } from "./types"
import { useWorkOrderForm } from "./hooks/useWorkOrderForm"
import { FormSections } from "./form-sections/FormSections"

export function WorkOrderForm({ workOrder, onSuccess }: WorkOrderFormProps) {
  const { form, onSubmit } = useWorkOrderForm(workOrder, onSuccess)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await form.handleSubmit(onSubmit)(e)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSections 
          form={form}
          isSubmitting={form.formState.isSubmitting}
          isEditing={!!workOrder}
        />
      </form>
    </Form>
  )
}