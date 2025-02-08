
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "./types"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { PPFPackageField } from "./service-details/PPFPackageField"
import { WindowTintField } from "./service-details/WindowTintField"
import { AutoDetailingField } from "./service-details/AutoDetailingField"
import { ServiceImageUpload } from "./service-details/ServiceImageUpload"

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
  if (!service) return null

  const serviceDetails = form.watch('service_details')[serviceId] || {}
  const images = (serviceDetails.images || []) as string[]

  const renderServiceSpecificFields = () => {
    switch (service.name.toLowerCase()) {
      case 'ppf':
        return <PPFPackageField form={form} serviceId={serviceId} />
      case 'window tint':
        return <WindowTintField form={form} serviceId={serviceId} />
      case 'auto detailing':
        return <AutoDetailingField form={form} serviceId={serviceId} />
      case 'wrap':
        return (
          <div className="text-center p-4 bg-muted rounded-lg">
            Coming soon! We're still determining our wrap packages.
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        
        {renderServiceSpecificFields()}

        <FormField
          control={form.control}
          name={`service_details.${serviceId}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please describe what you need..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ServiceImageUpload 
          images={images}
          onImageUpload={(files) => onImageUpload(files, serviceId)}
          onImageRemove={(url) => onImageRemove(url, serviceId)}
        />
      </div>
    </motion.div>
  )
}

