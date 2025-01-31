import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { formSchema } from "../QuoteRequestFormFields"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
            <ToggleGroup 
              type="single" 
              value={field.value} 
              onValueChange={field.onChange}
              className="flex flex-wrap gap-2"
            >
              {services?.map((service) => (
                <ToggleGroupItem 
                  key={service.id} 
                  value={service.id}
                  className="px-4 py-2 rounded-md data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
                >
                  {service.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}