import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"

type SidekickAssignmentFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
  bayId: string | null | undefined
}

export function SidekickAssignmentField({ form, bayId }: SidekickAssignmentFieldProps) {
  const { data: sidekicks = [], isLoading } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "sidekick")

      if (rolesError) throw rolesError

      const userIds = userRoles.map(role => role.user_id)

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)

      if (profilesError) throw profilesError

      return profiles
    },
    enabled: !!bayId
  })

  if (!bayId) return null

  if (isLoading) {
    return (
      <Card className="border-border/5 bg-[#1A1F2C]/80 mt-4">
        <CardContent className="p-4">
          <div className="animate-pulse text-white/60">Loading sidekicks...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/5 bg-[#1A1F2C]/80 mt-4">
      <CardContent className="p-4">
        <FormField
          control={form.control}
          name="assigned_sidekick_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">Assign Sidekick</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full bg-[#221F26]/60 border-border/5 text-white/80">
                    <SelectValue placeholder="Select a sidekick" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2C] border-border/5">
                    <SelectItem value="">None</SelectItem>
                    {sidekicks.map((sidekick) => (
                      <SelectItem 
                        key={sidekick.id} 
                        value={sidekick.id}
                        className="hover:bg-primary/10 text-white/80"
                      >
                        {`${sidekick.first_name || ''} ${sidekick.last_name || ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}