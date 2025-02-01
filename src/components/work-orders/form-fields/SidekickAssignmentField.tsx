import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type SidekickAssignmentFieldProps = {
  form: any
  serviceId: string
}

type Sidekick = {
  id: string
  profiles: {
    first_name: string | null
    last_name: string | null
  }
}

export function SidekickAssignmentField({ form, serviceId }: SidekickAssignmentFieldProps) {
  const { data: sidekicks = [] } = useQuery<Sidekick[]>({
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

      return profiles.map(profile => ({
        id: profile.id,
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name
        }
      }))
    }
  })

  return (
    <div className="space-y-2">
      <Label>Assign Sidekick</Label>
      <Select
        value={form.watch(`sidekick_assignments.${serviceId}`) || ""}
        onValueChange={(value) => form.setValue(`sidekick_assignments.${serviceId}`, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a sidekick" />
        </SelectTrigger>
        <SelectContent>
          {sidekicks.map((sidekick) => (
            <SelectItem key={sidekick.id} value={sidekick.id}>
              {`${sidekick.profiles.first_name || ''} ${sidekick.profiles.last_name || ''}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}