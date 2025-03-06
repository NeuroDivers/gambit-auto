
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WorkOrder } from "./types"  // Use our local WorkOrder type
import { WorkOrderCardHeader } from "./card/WorkOrderCardHeader"
import { WorkOrderCardDetails } from "./card/WorkOrderCardDetails"
import { WorkOrderCardActions } from "./card/WorkOrderCardActions"

export function WorkOrderCard({ request }: { request: WorkOrder }) {
  if (!request) return null;

  // Ensure required fields for the global WorkOrder type are present
  const workOrderWithRequiredFields = {
    ...request,
    contact_preference: request.contact_preference || "email" // Default to email if missing
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-xl bg-gradient-to-br from-card to-card/95 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-4">
        <WorkOrderCardHeader request={workOrderWithRequiredFields} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <WorkOrderCardDetails request={workOrderWithRequiredFields} />
          {request?.additional_notes && (
            <div className="bg-background/40 rounded-lg p-3 mt-3">
              <span className="text-sm text-muted-foreground block mb-1">Notes</span>
              <p className="text-sm">{request.additional_notes}</p>
            </div>
          )}
          <WorkOrderCardActions workOrder={workOrderWithRequiredFields} />
        </div>
      </CardContent>
    </Card>
  )
}
