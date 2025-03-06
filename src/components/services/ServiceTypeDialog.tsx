
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { ServiceTypeFormFields, formSchema, type ServiceTypeFormValues } from "./ServiceTypeFormFields"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useQuery } from "@tanstack/react-query"
import { ServiceType } from "@/integrations/supabase/types/service-types"

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

  // Fetch parent services (for sub-service selection)
  const { data: parentServices, isLoading: loadingParentServices } = useQuery({
    queryKey: ["parent-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name")
        .eq("status", "active")
        .in("service_type", ["standalone", "bundle"])
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && form.watch("service_type") === "sub_service",
  });

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

  // Watch for service type changes to handle parent service field
  const currentServiceType = form.watch("service_type");

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
        parent_service_id: data.service_type === "sub_service" && data.parent_service_id ? 
          data.parent_service_id : null,
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standalone">Standalone Service</SelectItem>
                      <SelectItem value="sub_service">Sub Service</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {currentServiceType === "sub_service" && (
              <FormField
                control={form.control}
                name="parent_service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Service</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingParentServices ? (
                          <SelectItem value="" disabled>Loading...</SelectItem>
                        ) : parentServices && parentServices.length > 0 ? (
                          parentServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No parent services available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Remove the default form fields since we've added them separately */}
            <div className="space-y-4">
              {currentServiceType !== "sub_service" && <div className="hidden">
                <FormField
                  control={form.control}
                  name="parent_service_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pricing_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        type="number" 
                        step="0.01" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimated_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Time (minutes)</FormLabel>
                    <FormControl>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        type="number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Visibility Settings Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-base mb-3">Visibility Settings</h3>
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Service is available for selection in this application
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'}
                          onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visible_on_app"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visible on Mobile App</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Service will be visible to users on the mobile application
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visible_on_website"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visible on Website</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Service will be visible to users on the public website
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
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
