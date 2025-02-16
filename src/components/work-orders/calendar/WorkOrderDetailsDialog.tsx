
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WorkOrder } from "../types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type WorkOrderDetailsDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkOrderDetailsDialog({ workOrder, open, onOpenChange }: WorkOrderDetailsDialogProps) {
  const { data: services } = useQuery({
    queryKey: ['workOrderServices', workOrder.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_services')
        .select(`
          *,
          service:service_types!work_order_services_service_id_fkey(
            name,
            price
          )
        `)
        .eq('work_order_id', workOrder.id)

      if (error) throw error
      return data
    },
    enabled: open
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Work Order Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p>Name: {workOrder.first_name} {workOrder.last_name}</p>
              <p>Email: {workOrder.email}</p>
              <p>Phone: {workOrder.phone_number}</p>
              <p>Contact Preference: {workOrder.contact_preference}</p>
              {workOrder.address && <p>Address: {workOrder.address}</p>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Vehicle Information</h3>
            <div className="space-y-1 text-sm">
              <p>Make: {workOrder.vehicle_make}</p>
              <p>Model: {workOrder.vehicle_model}</p>
              <p>Year: {workOrder.vehicle_year}</p>
              <p>Serial: {workOrder.vehicle_serial}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Services</h3>
            <div className="space-y-2">
              {services?.map((service) => (
                <div 
                  key={service.id} 
                  className="p-3 rounded-lg bg-muted/50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{service.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {service.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(service.unit_price * service.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              {services?.length === 0 && (
                <p className="text-sm text-muted-foreground">No services added</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Additional Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <Badge>{workOrder.status}</Badge>
              </div>
              {workOrder.start_time && (
                <p className="text-sm">
                  Start Time: {format(new Date(workOrder.start_time), "PPP p")}
                </p>
              )}
              {workOrder.estimated_duration && (
                <p className="text-sm">
                  Estimated Duration: {workOrder.estimated_duration}
                </p>
              )}
              {workOrder.end_time && (
                <p className="text-sm">
                  End Time: {format(new Date(workOrder.end_time), "PPP p")}
                </p>
              )}
              {workOrder.additional_notes && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm">{workOrder.additional_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
