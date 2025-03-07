import { WorkOrder } from "./types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

interface WorkOrderDrawerProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function WorkOrderDrawer({
  workOrder,
  open,
  onOpenChange,
  onEdit
}: WorkOrderDrawerProps) {
  if (!workOrder) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not scheduled";
    return format(new Date(dateString), "MMM d, yyyy - h:mm a");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="border-b">
            <div className="flex justify-between items-center">
              <DrawerTitle className="text-xl">
                Work Order Details
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              Created on {format(new Date(workOrder.created_at), "MMM d, yyyy")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Customer</h3>
              <p className="text-sm">{workOrder.customer_first_name} {workOrder.customer_last_name}</p>
              <p className="text-sm text-muted-foreground">{workOrder.customer_email}</p>
              <p className="text-sm text-muted-foreground">{workOrder.customer_phone}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Vehicle</h3>
              <p className="text-sm">{workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</p>
              {workOrder.vehicle_vin && <p className="text-sm text-muted-foreground">VIN: {workOrder.vehicle_vin}</p>}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Schedule</h3>
              <p className="text-sm">{formatDate(workOrder.start_time)}</p>
              {workOrder.service_bay && (
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {workOrder.service_bay ? `Bay: ${workOrder.service_bay.name}` : "No bay assigned"}
                  </span>
                </div>
              )}
            </div>
            
            {workOrder.additional_notes && (
              <div>
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-sm">{workOrder.additional_notes}</p>
              </div>
            )}
          </div>
          <DrawerFooter className="border-t pt-4">
            {onEdit && (
              <Button 
                onClick={onEdit}
                className="w-full"
              >
                Edit Work Order
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
