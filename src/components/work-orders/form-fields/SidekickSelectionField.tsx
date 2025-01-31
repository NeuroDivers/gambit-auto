import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type SidekickSelectionFieldProps = {
  control: Control<WorkOrderFormValues>
}

interface SidekickQueryResult {
  user_id: string
  role: string
  profiles: {
    first_name: string | null
    last_name: string | null
  }
}

export function SidekickSelectionField({ control }: SidekickSelectionFieldProps) {
  const { data: sidekicks, isLoading } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          profiles:profiles(
            first_name,
            last_name
          )
        `)
        .eq("role", "sidekick")

      if (error) throw error
      return data as SidekickQueryResult[]
    },
  })

  return (
    <FormField
      control={control}
      name="assigned_sidekick_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Sidekick</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a sidekick" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {sidekicks?.map((sidekick) => (
                <SelectItem key={sidekick.user_id} value={sidekick.user_id}>
                  {sidekick.profiles.first_name} {sidekick.profiles.last_name}
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