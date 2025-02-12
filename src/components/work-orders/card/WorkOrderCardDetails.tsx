
import { WorkOrder } from "../types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

type WorkOrderCardDetailsProps = {
  request: WorkOrder
}

type SidekickProfile = {
  first_name: string | null
  last_name: string | null
}

export function WorkOrderCardDetails({ request }: WorkOrderCardDetailsProps) {
  const { data: assignedSidekick } = useQuery({
    queryKey: ["sidekick", request.assigned_bay_id],
    queryFn: async () => {
      if (!request.assigned_bay_id) return null
      
      // First get the bay to get the profile ID
      const { data: bay } = await supabase
        .from("service_bays")
        .select("assigned_profile_id, name")
        .eq("id", request.assigned_bay_id)
        .maybeSingle()

      if (!bay?.assigned_profile_id) return { profile: null, bayName: bay?.name }

      // Then get the profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", bay.assigned_profile_id)
        .maybeSingle()

      return { 
        profile: profile as SidekickProfile,
        bayName: bay.name
      }
    },
    enabled: !!request.assigned_bay_id
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Vehicle:</span>{" "}
          <span className="text-foreground">
            {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">VIN:</span>{" "}
          <span className="text-foreground">{request.vehicle_serial}</span>
        </div>
        {request.start_time && (
          <div className="text-sm">
            <span className="text-muted-foreground">Scheduled for:</span>{" "}
            <span className="text-foreground">
              {format(parseISO(request.start_time), "PPp")}
            </span>
          </div>
        )}
        {request.assigned_bay_id && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Assignment:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10">
                {assignedSidekick?.bayName || 'Bay assigned'}
              </Badge>
              {assignedSidekick?.profile ? (
                <Badge variant="outline" className="gap-1.5 text-emerald-400 border-emerald-400/20 bg-emerald-400/10">
                  <User className="h-3 w-3" />
                  {assignedSidekick.profile.first_name} {assignedSidekick.profile.last_name}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  No sidekick assigned
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
