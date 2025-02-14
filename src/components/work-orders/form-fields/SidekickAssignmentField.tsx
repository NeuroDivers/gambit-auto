
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { useAssignableProfiles } from "@/components/service-bays/hooks/useAssignableProfiles"

type SidekickAssignmentFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function SidekickAssignmentField({ form }: SidekickAssignmentFieldProps) {
  const { profiles = [] } = useAssignableProfiles()

  return (
    <FormField
      control={form.control}
      name="assigned_profile_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign User</FormLabel>
          <FormControl>
            <Select
              value={field.value || "unassigned"}
              onValueChange={(value) => {
                console.log("Selected user:", value)
                field.onChange(value === "unassigned" ? null : value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  None
                </SelectItem>
                {profiles.map((profile) => (
                  <SelectItem 
                    key={profile.id} 
                    value={profile.id}
                  >
                    {`${profile.first_name || ''} ${profile.last_name || ''}`}
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
