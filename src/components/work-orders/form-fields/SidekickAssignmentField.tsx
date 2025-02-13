
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { useAssignableProfiles } from "@/components/service-bays/hooks/useAssignableProfiles"

type SidekickAssignmentFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
  bayId: string | null | undefined
}

export function SidekickAssignmentField({ form, bayId }: SidekickAssignmentFieldProps) {
  const { profiles = [] } = useAssignableProfiles()

  if (!bayId) return null

  return (
    <Card className="border-gray-200 bg-white/80 mt-4 shadow-sm">
      <CardContent className="p-4">
        <FormField
          control={form.control}
          name="assigned_profile_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Assign User</FormLabel>
              <FormControl>
                <Select
                  value={field.value || "unassigned"}
                  onValueChange={(value) => {
                    console.log("Selected user:", value)
                    field.onChange(value === "unassigned" ? null : value)
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="unassigned" className="text-gray-700">
                      None
                    </SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem 
                        key={profile.id} 
                        value={profile.id}
                        className="text-gray-700"
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
      </CardContent>
    </Card>
  )
}
