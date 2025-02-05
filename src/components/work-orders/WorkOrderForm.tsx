import { Form } from "@/components/ui/form"
import { WorkOrderFormProps } from "./types"
import { useWorkOrderForm } from "./hooks/useWorkOrderForm"
import { FormSections } from "./form-sections/FormSections"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function WorkOrderForm({ workOrder, onSuccess, defaultStartTime }: WorkOrderFormProps) {
  const { form, onSubmit } = useWorkOrderForm(workOrder, () => {
    toast.success(workOrder ? "Work order updated successfully" : "Work order created successfully")
    onSuccess?.()
  }, defaultStartTime)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Form submission started")
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
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            onClick={(e) => e.stopPropagation()}
          >
            {form.formState.isSubmitting ? 
              (workOrder ? "Updating..." : "Creating...") : 
              (workOrder ? "Update Work Order" : "Create Work Order")
            }
          </Button>
        </div>
      </form>
    </Form>
  )
}