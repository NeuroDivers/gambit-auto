import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

type SidekickAssignmentProps = {
  bayId: string
  currentSidekickId: string | null | undefined
}

export function SidekickAssignment({ bayId, currentSidekickId }: SidekickAssignmentProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: sidekicks } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      console.log("Fetching sidekicks...")
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
  })

  useEffect(() => {
    // Subscribe to changes in user_roles table
    const rolesChannel = supabase
      .channel('roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `role=eq.sidekick`
        },
        () => {
          console.log("Sidekick roles changed, invalidating query...")
          queryClient.invalidateQueries({ queryKey: ["sidekicks"] })
        }
      )
      .subscribe()

    // Subscribe to changes in profiles table
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log("Profiles changed, invalidating query...")
          queryClient.invalidateQueries({ queryKey: ["sidekicks"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(rolesChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [queryClient])

  const handleAssignSidekick = async (sidekickId: string | null) => {
    try {
      const { error } = await supabase
        .from("service_bays")
        .update({ assigned_sidekick_id: sidekickId })
        .eq("id", bayId)

      if (error) throw error

      toast({
        title: "Success",
        description: sidekickId ? "Sidekick assigned successfully" : "Sidekick unassigned successfully",
      })

      queryClient.invalidateQueries({ queryKey: ["serviceBays"] })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-2">
      <Label>Assigned Sidekick</Label>
      <Select
        value={currentSidekickId || "none"}
        onValueChange={(value) => handleAssignSidekick(value === "none" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a sidekick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {sidekicks?.map((sidekick) => (
            <SelectItem key={sidekick.id} value={sidekick.id}>
              {sidekick.first_name} {sidekick.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}