import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Control } from "react-hook-form"
import { WorkOrderFormValues } from "../types"

type BaySelectionFieldProps = {
  control: Control<WorkOrderFormValues>
}

export function BaySelectionField({ control }: BaySelectionFieldProps) {
  const { data: serviceBays } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("status", "available")
      if (error) throw error
      return data
    },
  })

  return (
    <FormField
      control={control}
      name="assigned_bay_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service Bay</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a service bay" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {serviceBays?.map((bay) => (
                <SelectItem key={bay.id} value={bay.id}>
                  {bay.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}