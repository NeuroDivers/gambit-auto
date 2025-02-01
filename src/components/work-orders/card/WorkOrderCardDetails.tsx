import { WorkOrder } from "../types"

type WorkOrderCardDetailsProps = {
  request: WorkOrder
}

export function WorkOrderCardDetails({ request }: WorkOrderCardDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="bg-background/40 rounded-lg p-3">
          <span className="text-sm text-white/50 block mb-1">Services</span>
          <p className="text-sm text-white/90">
            {request.work_order_services
              .map(service => service.service_types.name)
              .join(", ")}
          </p>
        </div>
        <div className="bg-background/40 rounded-lg p-3">
          <span className="text-sm text-white/50 block mb-1">Contact</span>
          <p className="text-sm text-white/90">
            {request.contact_preference === "email" ? request.email : request.phone_number}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-background/40 rounded-lg p-3">
          <span className="text-sm text-white/50 block mb-1">Serial Number</span>
          <p className="text-sm text-white/90">{request.vehicle_serial}</p>
        </div>
        <div className="bg-background/40 rounded-lg p-3">
          <span className="text-sm text-white/50 block mb-1">Price</span>
          <p className="text-sm text-white/90">${request.price?.toFixed(2) ?? '0.00'}</p>
        </div>
      </div>
    </div>
  )
}