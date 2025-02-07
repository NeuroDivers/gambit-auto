
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

type ServiceType = {
  id: string
  name: string
  price: number | null
  status: string
}

type ServiceSelectionSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
  services: ServiceType[]
}

const formSchema = z.object({
  service_ids: z.array(z.string()).min(1, "Please select at least one service")
})

export function ServiceSelectionSection({ form, services }: ServiceSelectionSectionProps) {
  const handleServiceChange = (serviceId: string, checked: boolean, field: any) => {
    const currentValue = field.value || []
    const newValue = checked 
      ? [...currentValue, serviceId]
      : currentValue.filter((id: string) => id !== serviceId)
    field.onChange(newValue)
  }

  return (
    <FormField
      control={form.control}
      name="service_ids"
      render={() => (
        <FormItem className="rounded-xl border border-[#9b87f5]/20 p-6 bg-[#1A1F2C]/40 backdrop-blur-sm">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-6">
            Available Services
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => (
              <FormField
                key={service.id}
                control={form.control}
                name="service_ids"
                render={({ field }) => {
                  const isChecked = field.value?.includes(service.id)
                  return (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        relative overflow-hidden rounded-lg border transition-all duration-300
                        ${isChecked 
                          ? 'border-[#9b87f5] bg-[#9b87f5]/10' 
                          : 'border-white/10 bg-[#1A1F2C]/60 hover:border-[#9b87f5]/50'}
                      `}
                    >
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => handleServiceChange(service.id, !isChecked, field)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <FormLabel className="text-lg font-medium text-white/90">
                              {service.name}
                            </FormLabel>
                            {service.price && (
                              <p className="text-sm text-white/60">
                                Starting from ${service.price}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            {isChecked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[#9b87f5]"
                              >
                                <CheckCircle className="w-6 h-6" />
                              </motion.div>
                            )}
                            <FormControl>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  handleServiceChange(service.id, checked, field)
                                }}
                                className="data-[state=checked]:bg-[#9b87f5]"
                              />
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      {isChecked && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          className="absolute bottom-0 left-0 h-1 bg-[#9b87f5]"
                        />
                      )}
                    </motion.div>
                  )
                }}
              />
            ))}
          </div>
          <FormMessage className="mt-4 text-[#ff6b6b]" />
        </FormItem>
      )}
    />
  )
}
