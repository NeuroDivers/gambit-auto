
import { Form } from "@/components/ui/form"
import { WorkOrderFormProps } from "./types"
import { useWorkOrderForm } from "./hooks/useWorkOrderForm"
import { FormSections } from "./form-sections/FormSections"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect, useRef } from "react"

export function WorkOrderForm({ workOrder, onSuccess, defaultStartTime, onSubmitting }: WorkOrderFormProps) {
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const { form, onSubmit } = useWorkOrderForm(workOrder, () => {
    toast.success(workOrder ? "Work order updated successfully" : "Work order created successfully")
    if (mounted.current && onSuccess) {
      onSuccess();
    }
  }, defaultStartTime);

  useEffect(() => {
    if (onSubmitting && mounted.current) {
      onSubmitting(form.formState.isSubmitting);
    }
    
    return () => {
      if (onSubmitting && mounted.current) {
        onSubmitting(false);
      }
    };
  }, [form.formState.isSubmitting, onSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!mounted.current) return;
    
    try {
      await form.handleSubmit(onSubmit)(e);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save work order");
      if (onSubmitting && mounted.current) {
        onSubmitting(false);
      }
    }
  };

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
  );
}
