
import { WorkOrder } from "../types"

interface WorkOrdersSectionProps {
  workOrders: WorkOrder[]
}

export function WorkOrdersSection({ workOrders }: WorkOrdersSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Work Orders</h2>
      {workOrders.length === 0 ? (
        <p className="text-muted-foreground">No work orders found</p>
      ) : (
        <ul className="space-y-2">
          {workOrders.map(order => (
            <li key={order.id} className="p-3 border rounded-md">
              <p className="font-medium">{order.customer_first_name} {order.customer_last_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              <p className="text-sm mt-1">
                {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
