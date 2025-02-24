
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { ServiceDetailsStepProps } from "./types"
import { ServiceImageUpload } from "./service-details/ServiceImageUpload"
import { PPFPackageField } from "./service-details/PPFPackageField"
import { WindowTintField } from "./service-details/WindowTintField"
import { AutoDetailingField } from "./service-details/AutoDetailingField"

export function ServiceDetailsStep({ 
  form, 
  services, 
  serviceId,
  onImageUpload,
  onImageRemove 
}: ServiceDetailsStepProps) {
  const service = services.find(s => s.id === serviceId)
  const serviceDetails = form.watch(`service_details.${serviceId}`) || {}
  const images = serviceDetails.images || []
  
  if (!service) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{service.name}</h2>
        <p className="text-sm text-muted-foreground">
          {service.description || "Please provide additional details about your service request."}
        </p>
      </div>

      <div className="space-y-6">
        {service.hierarchy_type === 'ppf' && (
          <PPFPackageField form={form} serviceId={serviceId} />
        )}
        
        {service.hierarchy_type === 'window_tint' && (
          <WindowTintField form={form} serviceId={serviceId} />
        )}
        
        {service.hierarchy_type === 'detailing' && (
          <AutoDetailingField form={form} serviceId={serviceId} />
        )}

        <FormField
          control={form.control}
          name={`service_details.${serviceId}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder="Please provide any specific requirements or concerns..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Upload Images</FormLabel>
          <ServiceImageUpload
            images={images}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
          />
        </div>
      </div>
    </div>
  )
}
