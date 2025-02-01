import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

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
  const { data: service } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("name")
        .eq("id", serviceId)
        .single()
      
      if (error) throw error
      return data
    }
  })

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
    <Card className="border-border/5 bg-[#1A1F2C]/80 mt-4">
      <CardContent className="p-4">
        <Label className="text-white/90 mb-2 block">
          Assign Sidekick for {service?.name}
        </Label>
        <Select
          value={form.watch(`sidekick_assignments.${serviceId}`) || ""}
          onValueChange={(value) => form.setValue(`sidekick_assignments.${serviceId}`, value)}
        >
          <SelectTrigger className="w-full bg-[#221F26]/60 border-border/5 text-white/80">
            <SelectValue placeholder="Select a sidekick" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F2C] border-border/5">
            {sidekicks.map((sidekick) => (
              <SelectItem 
                key={sidekick.id} 
                value={sidekick.id}
                className="hover:bg-primary/10 text-white/80"
              >
                {`${sidekick.profiles.first_name || ''} ${sidekick.profiles.last_name || ''}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}