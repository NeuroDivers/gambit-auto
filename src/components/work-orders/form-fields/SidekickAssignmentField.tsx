import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type SidekickAssignmentFieldProps = {
  form: UseFormReturn<any>
  serviceId: string
}

type Sidekick = {
  id: string
  name: string
}

export function SidekickAssignmentField({ form, serviceId }: SidekickAssignmentFieldProps) {
  const { data: sidekicks = [] } = useQuery<Sidekick[]>({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq("role", "sidekick")

      if (error) {
        console.error("Error fetching sidekicks:", error)
        return []
      }

      return userRoles.map(role => ({
        id: role.user_id,
        name: `${role.profiles?.first_name || ''} ${role.profiles?.last_name || ''}`
      }))
    }
  })

  return (
    <FormField
      control={form.control}
      name={`sidekick_assignments.${serviceId}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Sidekick</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a sidekick" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {sidekicks.map((sidekick) => (
                <SelectItem key={sidekick.id} value={sidekick.id}>
                  {sidekick.name}
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