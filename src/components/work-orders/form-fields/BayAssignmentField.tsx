
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type BayAssignmentFieldProps = {
  form: any
}

export function BayAssignmentField({ form }: BayAssignmentFieldProps) {
  const { data: serviceBays } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
  })

  return (
    <FormField
      control={form.control}
      name="assigned_bay_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Service Bay</FormLabel>
          <FormControl>
            <Select
              value={field.value || "none"}
              onValueChange={(value) => field.onChange(value === "none" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service bay..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {serviceBays?.map((bay) => (
                  <SelectItem key={bay.id} value={bay.id}>
                    {bay.name} ({bay.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
