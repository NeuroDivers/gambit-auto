
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { ServiceImageUpload } from "../form-steps/service-details/ServiceImageUpload"
import { PPFPackageField } from "./service-details/PPFPackageField"
import { WindowTintField } from "./service-details/WindowTintField"
import { AutoDetailingField } from "./service-details/AutoDetailingField"

type ServiceDetailsStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  services: any[]
  serviceId: string
  onImageUpload: (files: FileList, serviceId: string) => Promise<void>
  onImageRemove: (url: string, serviceId: string) => void
}

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

  const handleFilesUpload = async (files: FileList) => {
    await onImageUpload(files, serviceId)
  }

  const handleImageRemoveClick = (url: string) => {
    onImageRemove(url, serviceId)
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold mb-2">{service.name}</h2>
        <p className="text-sm text-muted-foreground">
          {service.description || "Please provide additional details about your service request."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Service Specific Fields */}
        {service.hierarchy_type === 'ppf' && (
          <PPFPackageField form={form} serviceId={serviceId} />
        )}
        
        {service.hierarchy_type === 'window_tint' && (
          <WindowTintField form={form} serviceId={serviceId} />
        )}
        
        {service.hierarchy_type === 'detailing' && (
          <AutoDetailingField form={form} serviceId={serviceId} />
        )}

        {/* Description Field */}
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

        {/* Image Upload Section */}
        <div className="space-y-4">
          <FormLabel>Upload Images</FormLabel>
          <ServiceImageUpload
            images={images}
            onImageUpload={handleFilesUpload}
            onImageRemove={handleImageRemoveClick}
          />
        </div>
      </div>
    </motion.div>
  )
}
