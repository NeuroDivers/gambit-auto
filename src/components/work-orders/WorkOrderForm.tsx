
import { Form } from "@/components/ui/form"
import { WorkOrderFormProps } from "./types"
import { useWorkOrderForm } from "./hooks/useWorkOrderForm"
import { FormSections } from "./form-sections/FormSections"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect } from "react"

export function WorkOrderForm({ workOrder, onSuccess, defaultStartTime, onSubmitting }: WorkOrderFormProps) {
  const { form, onSubmit } = useWorkOrderForm(workOrder, () => {
    toast.success(workOrder ? "Work order updated successfully" : "Work order created successfully")
    if (onSuccess) {
      // Add a small delay to ensure state updates are complete
      setTimeout(onSuccess, 100)
    }
  }, defaultStartTime)

  useEffect(() => {
    if (onSubmitting) {
      onSubmitting(form.formState.isSubmitting)
    }
    
    return () => {
      if (onSubmitting) {
        onSubmitting(false)
      }
    }
  }, [form.formState.isSubmitting, onSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await form.handleSubmit(onSubmit)(e)
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Failed to save work order")
      if (onSubmitting) {
        onSubmitting(false)
      }
    }
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
