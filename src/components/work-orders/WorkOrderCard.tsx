
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WorkOrder } from "@/types/work-order"
import { WorkOrderCardHeader } from "./card/WorkOrderCardHeader"
import { WorkOrderCardDetails } from "./card/WorkOrderCardDetails"
import { WorkOrderCardActions } from "./card/WorkOrderCardActions"

export function WorkOrderCard({ request }: { request: WorkOrder }) {
  if (!request) return null;

  // Create a copy with optional timeframe to satisfy the interface
  const workOrderWithTimeframe = {
    ...request,
    timeframe: request.timeframe as "flexible" | "asap" | "within_week" | "within_month" || "flexible"
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-xl bg-gradient-to-br from-card to-card/95 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-4">
        <WorkOrderCardHeader request={request} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <WorkOrderCardDetails request={request} />
          {request?.additional_notes && (
            <div className="bg-background/40 rounded-lg p-3 mt-3">
              <span className="text-sm text-white/50 block mb-1">Notes</span>
              <p className="text-sm text-white/90">{request.additional_notes}</p>
            </div>
          )}
          <WorkOrderCardActions workOrder={workOrderWithTimeframe} />
        </div>
      </CardContent>
    </Card>
  )
}
