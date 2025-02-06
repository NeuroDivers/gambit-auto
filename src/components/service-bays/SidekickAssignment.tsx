import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useSidekicks } from "./hooks/useSidekicks"

type SidekickAssignmentProps = {
  bayId: string
  currentSidekickId: string | null | undefined
}

export function SidekickAssignment({ bayId, currentSidekickId }: SidekickAssignmentProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { sidekicks } = useSidekicks()

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