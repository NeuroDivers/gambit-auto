
import { UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"
import { Badge } from "@/components/ui/badge"

type SummaryStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  services: any[]
}

export function SummaryStep({ form, services }: SummaryStepProps) {
  const formValues = form.getValues()
  
  const getServicePackage = (serviceId: string, packageId: string) => {
    const service = services?.find(s => s.id === serviceId)
    return service?.service_packages?.find((p: any) => p.id === packageId)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Make:</span> {formValues.vehicleInfo.make}</p>
            <p><span className="text-muted-foreground">Model:</span> {formValues.vehicleInfo.model}</p>
            <p><span className="text-muted-foreground">Year:</span> {formValues.vehicleInfo.year}</p>
            {formValues.vehicleInfo.vin && (
              <p><span className="text-muted-foreground">VIN:</span> {formValues.vehicleInfo.vin}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Selected Services</h3>
          <div className="space-y-4">
            {(formValues.service_items || []).map((item) => {
              const service = services?.find(s => s.id === item.service_id)
              const details = formValues.service_details[item.service_id]
              if (!service) return null

              const selectedPackage = details?.package_id 
                ? getServicePackage(item.service_id, details.package_id)
                : null

              return (
                <div key={item.service_id} className="rounded border p-3">
                  <h4 className="font-medium mb-2">{service.name}</h4>
                  {details && (
                    <div className="text-sm space-y-2">
                      {selectedPackage && (
                        <p>
                          <span className="text-muted-foreground">Selected Package:</span>{' '}
                          {selectedPackage.name} - ${selectedPackage.price}
                        </p>
                      )}
                      {'package_type' in details && (
                        <p>
                          <span className="text-muted-foreground">Package:</span>{' '}
                          {details.package_type.replace('_', ' ')}
                        </p>
                      )}
                      {'tint_type' in details && (
                        <p>
                          <span className="text-muted-foreground">Type:</span>{' '}
                          {details.tint_type.replace('_', ' ')}
                        </p>
                      )}
                      {'detail_type' in details && (
                        <p>
                          <span className="text-muted-foreground">Type:</span>{' '}
                          {details.detail_type}
                        </p>
                      )}
                      {details.description && (
                        <p>
                          <span className="text-muted-foreground">Details:</span>{' '}
                          {details.description}
                        </p>
                      )}
                      {details.images && details.images.length > 0 && (
                        <p className="text-muted-foreground">
                          {details.images.length} image{details.images.length !== 1 ? 's' : ''} uploaded
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
