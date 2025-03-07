import { MapPin } from "lucide-react";
import { WorkOrder } from "../types";

interface WorkOrderCardDetailsProps {
  workOrder: WorkOrder;
}

export function WorkOrderCardDetails({ workOrder }: WorkOrderCardDetailsProps) {
  return (
    <div className="grid gap-2">
      {/* Customer & Vehicle Info */}
      <div className="grid gap-1">
        <h4 className="font-semibold">Customer</h4>
        <p className="text-sm">{workOrder.customer_first_name} {workOrder.customer_last_name}</p>
        <p className="text-sm text-muted-foreground">{workOrder.customer_email}</p>
        {workOrder.customer_phone && <p className="text-sm text-muted-foreground">{workOrder.customer_phone}</p>}
      </div>
      
      <div className="grid gap-1">
        <h4 className="font-semibold">Vehicle</h4>
        <p className="text-sm">
          {workOrder.customer_vehicle_year} {workOrder.customer_vehicle_make} {workOrder.customer_vehicle_model}
        </p>
        {workOrder.customer_vehicle_vin && <p className="text-sm text-muted-foreground">VIN: {workOrder.customer_vehicle_vin}</p>}
      </div>
      
      {/* Location */}
      {workOrder.service_bay && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Bay: {workOrder.service_bay.name}</span>
        </div>
      )}
      
      {/* Additional Notes */}
      {workOrder.additional_notes && (
        <div className="grid gap-1">
          <h4 className="font-semibold">Notes</h4>
          <p className="text-sm text-muted-foreground">{workOrder.additional_notes}</p>
        </div>
      )}
    </div>
  );
}
