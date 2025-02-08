
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
      console.log("Fetching sidekicks for assignment field...")
      
      // Get all profiles that have a role with can_be_assigned_to_bay = true
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          role:role_id (
            name,
            can_be_assigned_to_bay
          )
        `)
        .eq('role.can_be_assigned_to_bay', true)

      if (profilesError) {
        console.error("Error fetching sidekick profiles:", profilesError)
        throw profilesError
      }

      console.log("Fetched sidekicks:", profiles)
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
                  value={field.value || "unassigned"}
                  onValueChange={(value) => {
                    console.log("Selected sidekick:", value)
                    field.onChange(value === "unassigned" ? null : value)
                  }}
                >
                  <SelectTrigger className="w-full bg-[#242424] border-white/10 text-white/[0.87]">
                    <SelectValue placeholder="Select a sidekick" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#242424] border-white/10">
                    <SelectItem value="unassigned" className="text-white/[0.87]">
                      None
                    </SelectItem>
                    {sidekicks.map((sidekick) => (
                      <SelectItem 
                        key={sidekick.id} 
                        value={sidekick.id}
                        className="text-white/[0.87]"
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
