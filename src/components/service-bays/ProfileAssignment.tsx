
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAssignableProfiles } from "./hooks/useAssignableProfiles"

type ProfileAssignmentProps = {
  bayId: string
  currentProfileId: string | null | undefined
}

export function ProfileAssignment({ bayId, currentProfileId }: ProfileAssignmentProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { profiles } = useAssignableProfiles()

  const handleAssignProfile = async (profileId: string | null) => {
    try {
      console.log("Assigning profile:", profileId, "to bay:", bayId)
      
      const { error } = await supabase
        .from("service_bays")
        .update({ assigned_profile_id: profileId })
        .eq("id", bayId)

      if (error) {
        console.error("Error assigning profile:", error)
        throw error
      }

      toast({
        title: "Success",
        description: profileId ? "Profile assigned successfully" : "Profile unassigned successfully",
      })

      queryClient.invalidateQueries({ queryKey: ["serviceBays"] })
    } catch (error) {
      console.error("Error in handleAssignProfile:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-2">
      <Label>Assigned Profile</Label>
      <Select
        value={currentProfileId || "none"}
        onValueChange={(value) => handleAssignProfile(value === "none" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {profiles?.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.first_name} {profile.last_name} ({profile.role?.nicename || 'No role'})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
