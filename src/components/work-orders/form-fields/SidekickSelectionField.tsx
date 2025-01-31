import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type SidekickSelectionFieldProps = {
  control: Control<WorkOrderFormValues>
}

interface SidekickProfile {
  first_name: string | null
  last_name: string | null
}

interface SidekickQueryResult {
  user_id: string
  role: string
  profiles: SidekickProfile
}

export function SidekickSelectionField({ control }: SidekickSelectionFieldProps) {
  const { data: sidekicks } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          user:profiles!user_id(first_name, last_name)
        `)
        .eq("role", "sidekick");

      if (error) throw error;
      
      // Transform the data to match our expected type
      return data.map(sidekick => ({
        user_id: sidekick.user_id,
        role: sidekick.role,
        profiles: sidekick.user
      })) as SidekickQueryResult[];
    },
  });

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