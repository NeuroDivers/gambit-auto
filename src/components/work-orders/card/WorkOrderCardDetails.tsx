import { WorkOrder } from "../types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

type WorkOrderCardDetailsProps = {
  request: WorkOrder
}

export function WorkOrderCardDetails({ request }: WorkOrderCardDetailsProps) {
  const { data: assignedSidekick } = useQuery({
    queryKey: ["sidekick", request.assigned_bay_id],
    queryFn: async () => {
      if (!request.assigned_bay_id) return null
      
      const { data: bay } = await supabase
        .from("service_bays")
        .select(`
          assigned_sidekick_id,
          profiles:assigned_sidekick_id (
            first_name,
            last_name
          )
        `)
        .eq("id", request.assigned_bay_id)
        .single()

      return bay?.profiles || null
    },
    enabled: !!request.assigned_bay_id
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <div className="text-sm">
          <span className="text-white/50">Vehicle:</span>{" "}
          <span className="text-white">
            {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-white/50">VIN:</span>{" "}
          <span className="text-white">{request.vehicle_serial}</span>
        </div>
        {request.start_time && (
          <div className="text-sm">
            <span className="text-white/50">Scheduled for:</span>{" "}
            <span className="text-white">
              {format(parseISO(request.start_time), "PPp")}
            </span>
          </div>
        )}
        {request.assigned_bay_id && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Assignment:</span>
            {assignedSidekick ? (
              <Badge variant="outline" className="gap-1.5">
                <User className="h-3 w-3" />
                {assignedSidekick.first_name} {assignedSidekick.last_name}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                Bay assigned, no sidekick yet
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}