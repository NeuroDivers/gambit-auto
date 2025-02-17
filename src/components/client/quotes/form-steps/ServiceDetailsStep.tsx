
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import { QuoteRequestFormData } from "./types"
import { ServiceImageUpload } from "./service-details/ServiceImageUpload"
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
    try {
      await onImageUpload(files, serviceId)
      // Get the current service details
      const currentDetails = form.getValues(`service_details.${serviceId}`) || {}
      const currentImages = currentDetails.images || []
      
      // Create URLs for the new files
      const newImageUrls = Array.from(files).map(file => URL.createObjectURL(file))
      
      // Update the form with the new images
      form.setValue(`service_details.${serviceId}.images`, [
        ...currentImages,
        ...newImageUrls
      ], { shouldValidate: true })
    } catch (error) {
      console.error('Error uploading images:', error)
    }
  }

  const handleImageRemoveClick = (url: string) => {
    onImageRemove(url, serviceId)
    // Get the current service details
    const currentDetails = form.getValues(`service_details.${serviceId}`) || {}
    const currentImages = currentDetails.images || []
    
    // Remove the image URL from the array
    const updatedImages = currentImages.filter((img: string) => img !== url)
    
    // Update the form
    form.setValue(`service_details.${serviceId}.images`, updatedImages, { shouldValidate: true })
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
