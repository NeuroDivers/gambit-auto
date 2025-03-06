
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ServiceTypeFormFields } from "./ServiceTypeFormFields"
import { useForm, FormProvider } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

type ServiceTypeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  serviceType?: any
}

export function ServiceTypeDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  serviceType 
}: ServiceTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  
  const methods = useForm({
    defaultValues: {
      name: serviceType?.name || "",
      description: serviceType?.description || "",
      base_price: serviceType?.base_price || 0,
      duration: serviceType?.duration || 60,
      service_type: serviceType?.service_type || "standalone",
      parent_service_id: serviceType?.parent_service_id || null,
      visible_on_app: serviceType?.visible_on_app !== false, // default to true if not specified
      visible_on_website: serviceType?.visible_on_website !== false, // default to true if not specified
      status: serviceType?.status || "active",
      hierarchy_type: serviceType?.hierarchy_type || "main"
    }
  })
  
  useEffect(() => {
    if (serviceType) {
      console.log("Resetting form with service type data:", serviceType);
      methods.reset({
        name: serviceType.name || "",
        description: serviceType.description || "",
        base_price: serviceType.base_price || 0,
        duration: serviceType.duration || 60,
        service_type: serviceType.service_type || "standalone",
        parent_service_id: serviceType.parent_service_id || null,
        visible_on_app: serviceType.visible_on_app !== false,
        visible_on_website: serviceType.visible_on_website !== false,
        status: serviceType.status || "active",
        hierarchy_type: serviceType.hierarchy_type || "main"
      });
    } else {
      methods.reset({
        name: "",
        description: "",
        base_price: 0,
        duration: 60,
        service_type: "standalone",
        parent_service_id: null,
        visible_on_app: true,
        visible_on_website: true,
        status: "active",
        hierarchy_type: "main"
      });
    }
  }, [serviceType, methods]);
  
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true)
    
    try {
      if (values.service_type === 'sub_service' && !values.parent_service_id) {
        toast.error("Please select a parent service")
        setIsSubmitting(false)
        return
      }
      
      if (values.service_type !== 'sub_service') {
        values.parent_service_id = null
      }
      
      // Set hierarchy_type based on service_type
      if (values.service_type === 'standalone') {
        values.hierarchy_type = 'main'
      } else if (values.service_type === 'sub_service') {
        values.hierarchy_type = 'sub'
      } else if (values.service_type === 'bundle') {
        values.hierarchy_type = 'bundle'
      }
      
      console.log("Submitting service type:", values);
      
      if (serviceType?.id) {
        const { error } = await supabase
          .from("service_types")
          .update({
            name: values.name,
            description: values.description,
            base_price: values.base_price,
            duration: values.duration,
            service_type: values.service_type,
            parent_service_id: values.parent_service_id,
            visible_on_app: values.visible_on_app,
            visible_on_website: values.visible_on_website,
            status: values.status,
            hierarchy_type: values.hierarchy_type,
            updated_at: new Date().toISOString()
          })
          .eq("id", serviceType.id)
        
        if (error) throw error
        
        toast.success("Service type updated")
      } else {
        const { error } = await supabase
          .from("service_types")
          .insert({
            name: values.name,
            description: values.description,
            base_price: values.base_price,
            duration: values.duration,
            service_type: values.service_type,
            parent_service_id: values.parent_service_id,
            visible_on_app: values.visible_on_app,
            visible_on_website: values.visible_on_website,
            status: values.status,
            hierarchy_type: values.hierarchy_type
          })
        
        if (error) throw error
        
        toast.success("Service type created")
      }
      
      queryClient.invalidateQueries({ queryKey: ["service-types"] })
      
      if (onSuccess) onSuccess()
      
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving service type:", error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {serviceType?.id ? "Edit Service Type" : "Create Service Type"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <ServiceTypeFormFields />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (serviceType?.id ? "Updating..." : "Creating...") 
                  : (serviceType?.id ? "Update" : "Create")
                }
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
