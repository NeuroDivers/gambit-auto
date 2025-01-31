import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { formSchema } from "../QuoteRequestFormFields"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type ServiceSelectionFieldProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
}

export function ServiceSelectionField({ form }: ServiceSelectionFieldProps) {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      
      if (error) throw error
      return data
    },
  })

  return (
    <FormField
      control={form.control}
      name="service_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <FormControl>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services?.map((service) => (
                <div
                  key={service.id}
                  onClick={() => field.onChange(service.id)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                    "hover:border-[#9b87f5] hover:shadow-md",
                    field.value === service.id
                      ? "border-[#9b87f5] bg-[#9b87f5]/10"
                      : "border-border"
                  )}
                >
                  {field.value === service.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-[#9b87f5]" />
                    </div>
                  )}
                  <h3 className="font-medium mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  )}
                  {service.price && (
                    <p className="text-sm font-medium mt-2">
                      Starting from ${service.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}