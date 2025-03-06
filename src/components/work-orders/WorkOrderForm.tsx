
import { Form } from "@/components/ui/form"
import { WorkOrderFormProps } from "./types"
import { useWorkOrderForm } from "./hooks/useWorkOrderForm"
import { FormSections } from "./form-sections/FormSections"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { CustomerSearch } from "./form-sections/CustomerSearch"
import { Loader2 } from "lucide-react"

export function WorkOrderForm({ workOrder, onSuccess, defaultStartTime, onSubmitting }: WorkOrderFormProps) {
  const mounted = useRef(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(workOrder?.client_id || null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Watch for changes to customer selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'client_id' && value.client_id) {
        setSelectedCustomerId(value.client_id as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (onSubmitting && mounted.current) {
      onSubmitting(isProcessing);
    }
    
    return () => {
      if (onSubmitting && mounted.current) {
        onSubmitting(false);
      }
    };
  }, [isProcessing, onSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!mounted.current) return;
    
    try {
      setIsProcessing(true);
      await form.handleSubmit(onSubmit)(e);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save work order");
    } finally {
      if (mounted.current) {
        setIsProcessing(false);
        if (onSubmitting) onSubmitting(false);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!workOrder && <CustomerSearch form={form} />}
        
        <FormSections 
          form={form}
          isSubmitting={isProcessing}
          isEditing={!!workOrder}
          customerId={selectedCustomerId}
        />
        
        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            disabled={isProcessing}
            className="min-w-[150px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {workOrder ? "Updating..." : "Creating..."}
              </>
            ) : (
              workOrder ? "Update Work Order" : "Create Work Order"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
