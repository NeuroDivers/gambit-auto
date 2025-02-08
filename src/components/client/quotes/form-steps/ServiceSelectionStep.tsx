
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "./types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type ServiceSelectionStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  services: any[]
}

export function ServiceSelectionStep({ form, services }: ServiceSelectionStepProps) {
  const handleServiceChange = (serviceId: string, checked: boolean, field: any) => {
    const currentValue = field.value || []
    const newValue = checked 
      ? [...currentValue, serviceId]
      : currentValue.filter((id: string) => id !== serviceId)
    field.onChange(newValue)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <FormField
        control={form.control}
        name="service_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Types</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "flex flex-col p-4 rounded-lg border transition-all cursor-pointer bg-[#121212]",
                    field.value?.includes(service.id) 
                      ? "border-primary bg-primary/10" 
                      : "border-border/40 hover:border-primary/50"
                  )}
                  onClick={() => handleServiceChange(service.id, !field.value?.includes(service.id), field)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{service.name}</h4>
                      {service.price && (
                        <p className="text-sm text-muted-foreground">
                          Starting from ${service.price}
                        </p>
                      )}
                    </div>
                    <div 
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        field.value?.includes(service.id) ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div 
                        className={cn(
                          "w-5 h-5 rounded-full bg-[#F1F1F1] absolute top-0.5 transition-transform",
                          field.value?.includes(service.id) ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </div>
                  </div>
                  
                  {service.service_packages && service.service_packages.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Available Packages:</p>
                      <div className="space-y-2">
                        {service.service_packages
                          .filter((pkg: any) => pkg.status === 'active')
                          .map((pkg: any) => (
                            <div 
                              key={pkg.id}
                              className="text-sm p-2 rounded bg-background/5"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{pkg.name}</span>
                                <span className="text-muted-foreground">${pkg.price}</span>
                              </div>
                              {pkg.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {pkg.description}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  )
}
