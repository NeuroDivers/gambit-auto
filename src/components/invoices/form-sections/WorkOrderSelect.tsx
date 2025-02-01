import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { WorkOrder } from "@/types"

type WorkOrderSelectProps = {
  workOrders?: WorkOrder[]
  selectedWorkOrderId: string
  onWorkOrderSelect: (workOrderId: string) => void
}

export function WorkOrderSelect({ 
  workOrders, 
  selectedWorkOrderId, 
  onWorkOrderSelect 
}: WorkOrderSelectProps) {
  return (
    <div>
      <Label>Work Order (Optional)</Label>
      <Select
        value={selectedWorkOrderId}
        onValueChange={onWorkOrderSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a work order to pre-fill form..." />
        </SelectTrigger>
        <SelectContent>
          {workOrders?.map((wo) => (
            <SelectItem key={wo.id} value={wo.id}>
              {wo.first_name} {wo.last_name} - {wo.vehicle_make} {wo.vehicle_model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}