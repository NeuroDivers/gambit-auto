
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { ServiceTypeFormFields, formSchema, type ServiceTypeFormValues } from "./ServiceTypeFormFields"

interface ServiceTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceType?: any
  onSuccess?: () => void
}

export function ServiceTypeDialog({ open, onOpenChange, serviceType, onSuccess }: ServiceTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      base_price: "",
      estimated_time: "",
      status: "active",
      service_type: "standalone",
      parent_service_id: "",
      pricing_model: "flat_rate",
      commission_rate: null,
      commission_type: null,
      visible_on_app: true,
      visible_on_website: true,
    }
  })

  // Update form values when serviceType changes or dialog opens
  useEffect(() => {
    if (serviceType && open) {
      form.reset({
        name: serviceType.name || "",
        description: serviceType.description || "",
        base_price: serviceType.base_price ? serviceType.base_price.toString() : "",
        estimated_time: serviceType.duration ? serviceType.duration.toString() : "",
        status: serviceType.status || "active",
        service_type: serviceType.service_type || "standalone",
        parent_service_id: serviceType.parent_service_id || "",
        pricing_model: serviceType.pricing_model || "flat_rate",
        commission_rate: null,
        commission_type: null,
        visible_on_app: serviceType.visible_on_app ?? true,
        visible_on_website: serviceType.visible_on_website ?? true,
      });
    } else if (!serviceType && open) {
      // Reset form to default values when creating a new service type
      form.reset({
        name: "",
        description: "",
        base_price: "",
        estimated_time: "",
        status: "active",
        service_type: "standalone",
        parent_service_id: "",
        pricing_model: "flat_rate",
        commission_rate: null,
        commission_type: null,
        visible_on_app: true,
        visible_on_website: true,
      });
    }
  }, [serviceType, form, open]);

  async function onSubmit(data: ServiceTypeFormValues) {
    setIsSubmitting(true)
    try {
      // Convert string fields to appropriate types
      const basePrice = data.base_price ? parseFloat(data.base_price) : null
      const duration = data.estimated_time ? parseInt(data.estimated_time, 10) : null
      
      // Prepare data for Supabase
      const serviceData = {
        name: data.name,
        description: data.description,
        base_price: basePrice,
        duration: duration,
        status: data.status,
        service_type: data.service_type,
        pricing_model: data.pricing_model,
        parent_service_id: data.parent_service_id && data.parent_service_id !== "" ? data.parent_service_id : null,
        visible_on_app: data.visible_on_app,
        visible_on_website: data.visible_on_website,
        // Exclude commission_rate and commission_type as they don't exist in the service_types table
      }

      let result
      if (serviceType?.id) {
        console.log('Updating service type with ID:', serviceType.id, 'and data:', serviceData)
        // Update existing service
        result = await supabase
          .from('service_types')
          .update(serviceData)
          .eq('id', serviceType.id)
      } else {
        // Insert new service
        result = await supabase
          .from('service_types')
          .insert(serviceData)
      }

      if (result.error) {
        console.error('Error saving service type:', result.error)
        toast.error("Failed to save service type")
        return
      }

      toast.success(`Service type ${serviceType?.id ? 'updated' : 'created'} successfully`)
      onSuccess?.()
    } catch (error) {
      console.error('Error in save:', error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{serviceType?.id ? 'Edit' : 'Create'} Service Type</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ServiceTypeFormFields form={form} />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
