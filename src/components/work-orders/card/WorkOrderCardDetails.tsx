
import { Clock, Calendar, MapPin, Car } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { WorkOrder } from "../types"

export function WorkOrderCardDetails({ request }: { request: WorkOrder }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Car className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">
            {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
          </p>
          {request.vehicle_vin && (
            <p className="text-xs text-muted-foreground">
              VIN: {request.vehicle_vin}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">
            {request.customer_first_name} {request.customer_last_name}
          </p>
          {request.customer_email && (
            <p className="text-xs text-muted-foreground">
              {request.customer_email}
            </p>
          )}
          {request.customer_phone && (
            <p className="text-xs text-muted-foreground">
              {request.customer_phone}
            </p>
          )}
          {request.customer_address && (
            <p className="text-xs text-muted-foreground">
              {request.customer_address}
            </p>
          )}
        </div>
      </div>
      
      {request.start_time && (
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">
              Scheduled for: {formatDate(request.start_time)}
            </p>
            {request.estimated_duration && (
              <p className="text-xs text-muted-foreground">
                Estimated duration: {request.estimated_duration}
              </p>
            )}
          </div>
        </div>
      )}
      
      {request.service_bays?.name && (
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">
              Assigned to bay: {request.service_bays.name}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
